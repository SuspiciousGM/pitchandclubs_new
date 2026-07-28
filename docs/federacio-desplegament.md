# Integración con la federación: despliegue y operación

Guía para poner en marcha la Fase 1 (conectar cuenta e importar el historial oficial).

## Qué se ha construido

| Pieza | Ruta |
|-------|------|
| Migración (tablas, RLS, funciones de Vault) | `supabase/migrations/20260729_federation_integration.sql` |
| Cliente de pitch.cat (login, scraping, parseo) | `supabase/functions/_shared/pitchcat.ts` |
| Mapeo de ronda oficial a partida de la app | `supabase/functions/_shared/rounds.ts` |
| Tests del parser | `supabase/functions/_shared/pitchcat.test.ts` |
| Verificar credenciales y guardarlas | `supabase/functions/federation-connect/` |
| Importar rondas | `supabase/functions/federation-sync/` |
| Desvincular cuenta | `supabase/functions/federation-disconnect/` |
| Pantalla de conexión | `src/screens/FederationConnectScreen.jsx` |
| Estado en el perfil | `src/components/FederationCard.jsx` |
| Historial con filtro de origen | `src/components/GameHistoryList.jsx` |
| Cliente de las funciones | `src/utils/federation.js` |

## Modelo de seguridad

- La contraseña de la federación se guarda **solo en Supabase Vault**, cifrada con una clave que vive fuera de la base de datos. Un dump de la BD no la expone.
- `federation_connections` guarda únicamente el **puntero** al secreto (`vault_secret_id`), nunca la contraseña.
- Las funciones `federation_store_credentials`, `federation_read_credentials`, `federation_delete_credentials` y `federation_mark_sync` son `SECURITY DEFINER` con `EXECUTE` **revocado a `anon` y `authenticated`** y concedido solo a `service_role`. El navegador no puede llamarlas.
- La contraseña viaja del navegador a `federation-connect` una sola vez y no se escribe en ninguna tabla, log ni respuesta. La pantalla la borra de su estado en cuanto se verifica.
- El consentimiento explícito se registra con fecha en `federation_connections.consent_at`.
- `federation-disconnect` borra el secreto del Vault y, si el usuario lo pide, también las rondas importadas.

> Recordatorio: el consentimiento documenta la autorización del usuario, pero la obligación de custodiar bien el secreto sigue siendo nuestra. Conviene revisar que nunca se exponga el esquema `vault` por RLS ni por una API.

## Pasos de despliegue

### 1. Aplicar la migración

Es idempotente, se puede re-ejecutar sin miedo.

```bash
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Alternativa: pegar el contenido del `.sql` en el SQL Editor del dashboard.

### 2. Desplegar las Edge Functions

```bash
npx supabase functions deploy federation-connect
npx supabase functions deploy federation-sync
npx supabase functions deploy federation-disconnect
```

No hacen falta secretos nuevos: usan `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`, que Supabase inyecta solo.

### 3. Probar con una cuenta real

Este es el paso que no se puede automatizar sin credenciales de la federación:

1. Entra en la app, ve a Perfil, sección Federación, y pulsa Conectar.
2. Introduce licencia y contraseña, acepta la autorización.
3. Comprueba que aparecen las rondas oficiales en el Historial y que el filtro Oficials/Amistoses funciona.

Si algo falla, los logs de la función dicen dónde:

```bash
npx supabase functions logs federation-sync
```

## Sincronización automática (Fase 3)

`federation-sync` ya acepta llamadas de un job programado. Con la service role key y el cuerpo vacío recorre todas las cuentas conectadas; con `{ "userId": "..." }` sincroniza una sola.

Programarlo con `pg_cron` cada 6 o 12 horas es suficiente: la federación no publica resultados con más frecuencia.

## Notas de operación

- **Deduplicación**: cada ronda deriva un `federation_round_id` de fecha, torneo, vuelta y modalidad. El sync hace `upsert` sobre `(user_id, federation_round_id)`, así que se puede repetir sin duplicar nada.
- **Coste de un sync**: una petición por página de resultados. Los scorecards vienen ya embebidos en esas páginas, así que un historial completo son pocos segundos. Los metros y el stroke index de cada hoyo viven en las fichas de torneo y se han dejado para la fase de estadísticas, precisamente para no acercarse al límite de tiempo de la función.
- **Fragilidad**: si la federación cambia su HTML, el estado pasa a `error` y `last_error` guarda el motivo, visible en el perfil. Los tests del parser (`npm run test:functions`, requiere Deno) son la primera línea de defensa al tocar el scraping.
- **Feed público**: las rondas importadas se excluyen del feed de actividad y de los eventos realtime. Sin eso, importar un historial largo enterraría el feed de toda la comunidad.
- **Puntos P&C**: las rondas oficiales se importan con **0 puntos** (`AWARD_POINTS` en `_shared/rounds.ts`). Es deliberado: conectar la cuenta no debe reordenar el ranking de golpe. Cómo deben puntuar es una decisión de producto de la Fase 3, y se activa cambiando esa constante y re-sincronizando.
