# CLAUDE.md

Guía para agentes (Claude Code) que trabajen en este repositorio.

## Qué es

**Pitch & Clubs** — marcador digital y PWA de pitch & putt para jugadores catalanes.
Producción: <https://pitchandclubs.cat>. Mobile-first, trilingüe (ca/es/en).

## Stack

- **Frontend**: React 19 + Vite 7, JavaScript puro (sin TypeScript). CSS escrito a mano.
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime + Edge Functions). No hay servidor propio.
- **Hosting**: Vercel (SPA, `vercel.json` reescribe todo a `/`).
- **Libs**: `@supabase/supabase-js`, `lucide-react` (iconos), `html2canvas` (share cards).

## Comandos

```bash
npm run dev       # desarrollo (http://localhost:5173)
npm run build     # build de producción -> dist/
npm run preview   # servir el build
npm run lint      # ESLint
```

## ⚠️ Requisitos y gotchas al ejecutar

- **Node.js 20.19+ o 22.12+ obligatorio.** Con Node 18 Vite 7 falla al arrancar con
  `TypeError: crypto.hash is not a function`. Verificar `node -v` antes de nada.
- **`.env` obligatorio** (no está en el repo, está en `.gitignore`). Sin él la app arranca
  pero falla en runtime al crear el cliente de Supabase. Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_VAPID_PUBLIC_KEY` (opcional, solo push)

## Arquitectura del frontend

- **Routing por estado, no por URL.** `App.jsx` mantiene `useState('screen')` y renderiza la
  pantalla condicionalmente. La única ruta real por path es `/g/:token` (partida compartida,
  ver `SharedGameRoute` y el match de `window.location.pathname` en `App.jsx`).
- **`App.jsx` es el orquestador**: estado global (user, history, liveGames, follows…),
  CSS global (string `G`), suscripción realtime (`games-feed`), y toda la lógica de
  crear/guardar/terminar partidas. Es grande (~800 líneas).
- **Persistencia local**: `localStorage` (`pc_screen`, `pc_gameData`, `pc_liveGameId`,
  `pc_liveShareToken`, `pc_gameStartedAt`…) para reanudar partidas tras recargar.
- **i18n**: `src/data/i18n.js`, prop `lang` propagada por todos los componentes. Idioma por
  defecto `"ca"`.
- **Lógica de negocio**: `src/utils/helpers.js` — `calcPCPoints` (Stableford propio),
  `calcGranada` (juego de apuestas), tiers en `src/data/constants.js` (Caddie/Player/Pro/Master).

## Backend / datos

- **Tablas**: `games`, `profiles`, `follows`, `push_subscriptions`, `tournaments`, `game_images`.
- **`profiles` es la fuente de verdad** para nombre y avatar: nunca sobrescribir con datos del
  proveedor OAuth valores editados manualmente (ver lógica en `App.jsx` onAuthStateChange).
- **RLS**: `supabase/migrations/20260310_security_hardening.sql`. Incluye rate-limit de 20
  partidas / 24h e integridad por check constraints.
- **RPC** (`SECURITY DEFINER`, validan al llamante): `create_live_game`, `save_linked_game`
  (guardar la partida en el historial de co-jugadores; el INSERT cross-user directo está
  bloqueado por RLS).
- **Edge Function**: `supabase/functions/notify-followers/index.ts` (Deno + web-push).
- **Anti-fraude** (cliente, en `handleGameFinish` de `App.jsx`): duración mínima de partida,
  scores imposibles, límites de partidas en solitario. Marca `fraudFlags` y bloquea puntos.
- El esquema base (CREATE TABLE, RPC `create_live_game`) **no está completo en `migrations/`**;
  parte vive solo en el dashboard de Supabase.

## Integración con la federación (FCPP / pitch.cat)

Fase 1 implementada: conectar la cuenta de pitch.cat e importar el historial oficial.
Ver `docs/plan-integracio-federacio.md` (producto) y `docs/federacio-desplegament.md` (despliegue).

- **Dos orígenes de partida**: `games.source` es `'manual'` (a mano en la app) o
  `'federation'` (importada, de solo lectura). El filtro del historial usa este campo.
- **Deduplicación**: `games.federation_round_id` deriva de fecha + torneo + vuelta + modalidad,
  con índice único `(user_id, federation_round_id)`. El sync hace upsert, es idempotente.
  El índice **no** es parcial a propósito: `ON CONFLICT` no puede inferir un índice con predicado
  desde PostgREST.
- **Credenciales**: la contraseña vive solo en Supabase Vault. `federation_connections` guarda
  el puntero. Las funciones `federation_*` son `SECURITY DEFINER` con EXECUTE solo para
  `service_role`; el navegador nunca puede leer un secreto.
- **Edge Functions**: `federation-connect` (verifica y guarda), `federation-sync` (importa,
  acepta llamada programada con service role), `federation-disconnect` (borra secreto y,
  opcionalmente, datos).
- **Scraping**: `_shared/pitchcat.ts`. Ojo con dos cosas del sitio: responde en `iso-8859-1`
  (no UTF-8) y la sesión va en cookie, así que los redirects se siguen a mano. Los scorecards
  vienen embebidos en las páginas de resultados; los metros y stroke index por hoyo están en las
  fichas de torneo y se dejaron para la Fase 2.
- **La raya (X) vale 5 golpes fijos**. Verificado: reproduce el bruto oficial en 34/34 vueltas
  individuales. El stroke index decide cuándo se puede parar, no el golpe que consta.
- **En parejas la tarjeta publicada es la del equipo**, no la del jugador (0/12 en FourBall).
  `resolveCard` no mira la modalidad: acepta la tarjeta solo si suma el bruto oficial, así el
  grid de hoyos y el total nunca se contradicen.
- **Resultado oficial**: `RB`/`RN` son puntos stableford en formato ST y golpes en ME. Se importan
  tal cual en vez de calcular stableford, lo que evita depender de la aritmética de hándicap
  (incluidos los hándicaps positivos).
- **Tests del parser**: `npm run test:functions` (requiere Deno). Es lo que protege el scraping
  cuando la federación cambie el HTML.
- **`created_at` de las importadas va a la fecha en que se jugó la vuelta**, no a la de
  importación, para que ordenar por `created_at` no entierre la actividad reciente. En realtime
  `App.jsx` descarta además las de más de 7 días. Nota: `activityFeed` no lo consume nadie hoy
  (`HomeScreen` no lo destructura); la lista visible de recientes es la de `LiveScreen`.
- **Puntos**: las rondas oficiales se importan con 0 puntos (`AWARD_POINTS` en `_shared/rounds.ts`)
  para no reordenar el ranking al conectar. Decisión de producto pendiente (Fase 3).

## Convenciones

- Componentes en `screens/` (pantallas completas) vs `components/` (reutilizables).
- Logs con prefijo `"P&C:"`.
- Textos de UI vía `i18n.js`; evitar strings hardcodeados nuevos.
- Sin tests ni TypeScript en el proyecto actualmente.

## Deuda técnica conocida

- **Seguridad RLS**: la policy `games_update_share_token` es `USING (share_token IS NOT NULL)`
  sin restricción de rol ni `WITH CHECK` → cualquier anónimo puede actualizar cualquier partida
  con token. Debería filtrar por el token concreto del cliente.
- `public/shutterstock_2470097539 1.png` (~79 MB) está commiteado y no se usa — sacar del repo.
- `pc-webapp-mvp-v7-2.jsx` (raíz, monolito legacy no referenciado) y el fichero vacío `main`
  son basura eliminable.
- README era la plantilla por defecto de Vite (ya actualizado).
