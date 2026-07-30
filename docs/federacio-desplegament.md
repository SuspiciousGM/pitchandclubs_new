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

## Lo que sabemos del HTML de pitch.cat

Verificado contra un historial real de 47 vueltas. Esto es lo que hay que respetar al tocar el parser.

**Columnas de la tabla de resultados** (`table.llistat`, filas `tr.fila`):

```
0 Data | 1 Torneig | 2 Camp | 3 Mod. | 4 For. | 5 V. | 6 HPJ | 7 HPP
8 RB | 9 RN | 10 HPEI | 11 HPEF | 12 (vacía) | 13 CB | 14 CN
```

- `CB`/`CN`: cops bruts y nets (golpes).
- `RB`/`RN`: el resultado oficial. En formato `ST` son **puntos stableford**; en `ME` son golpes.
  Por eso no calculamos stableford nosotros: se importa el número oficial y así no dependemos de
  la aritmética de hándicap (incluidos los hándicaps positivos, donde un birdie en el hoyo de
  hándicap 18 vale 2 puntos y no 3).
- `HPJ`: hándicap de juego de esa vuelta.

**La raya (X) vale 5 golpes.** Una X significa que el jugador dejó de jugar el hoyo porque ya no
podía puntuar. El stroke index del hoyo determina *cuándo* puede parar, pero el golpe que consta
en el bruto es **5 fijo**: sumando la tarjeta con cada raya a 5 se reproduce el `CB` oficial en
**34 de 34** vueltas individuales. Por eso no hace falta el stroke index para importar.

**En parejas la tarjeta publicada no es la del jugador.** En FourBall (`FB`) la tarjeta que
acompaña al resultado es la bola del equipo, y no cuadra con el `CB` individual (0 de 12 vueltas).
En vez de decidirlo por el código de modalidad, `resolveCard` comprueba la aritmética: la tarjeta
solo se muestra como propia si suma exactamente el bruto oficial. Así el grid de hoyos y el total
nunca se contradicen, y la regla sigue valiendo si aparece una modalidad nueva.

**Las fichas de torneo** (`torneig.php?id=`) tienen filas `Metres:` y `Handicap:` (stroke index)
por hoyo, y además una fila con el nombre del jugador y su tarjeta individual. De ahí saldrán las
estadísticas por longitud y dificultad de la Fase 2, y la tarjeta propia en vueltas de parejas.

## Notas de operación

- **Deduplicación**: cada ronda deriva un `federation_round_id` de fecha, torneo, vuelta y modalidad. El sync hace `upsert` sobre `(user_id, federation_round_id)`, así que se puede repetir sin duplicar nada.
- **Coste de un sync**: una petición por página de resultados. Los scorecards vienen ya embebidos en esas páginas, así que un historial completo son pocos segundos. Los metros y el stroke index de cada hoyo viven en las fichas de torneo y se han dejado para la fase de estadísticas, precisamente para no acercarse al límite de tiempo de la función.
- **Fragilidad**: si la federación cambia su HTML, el estado pasa a `error` y `last_error` guarda el motivo, visible en el perfil. Los tests del parser (`npm run test:functions`, requiere Deno) son la primera línea de defensa al tocar el scraping.
- **Feed y `created_at`**: las rondas importadas se guardan con `created_at` en la **fecha en que se jugaron**, no en la de importación. Así compiten en igualdad en cualquier lista ordenada por `created_at` sin que una importación masiva entierre la actividad reciente. En realtime sí hace falta un filtro extra: un sync dispara un INSERT por fila, así que `App.jsx` descarta las que tengan más de 7 días antes de pedir avatares y reordena el feed por fecha.
- **Ojo**: `activityFeed` se calcula en `App.jsx` y se pasa a `HomeScreen`, pero hoy `HomeScreen` no lo consume, así que no se muestra en ninguna parte. La lista visible de "últimes partides" es la de `LiveScreen`, que ordena por `created_at` y ya marca las oficiales.
- **Puntos P&C**: las rondas oficiales se importan con **0 puntos** (`AWARD_POINTS` en `_shared/rounds.ts`). Es deliberado: conectar la cuenta no debe reordenar el ranking de golpe. Cómo deben puntuar es una decisión de producto de la Fase 3, y se activa cambiando esa constante y re-sincronizando.
