# Pitch & Clubs

Marcador digital y PWA de **pitch & putt** para jugadores catalanes: marcador de partidas, ranking, historial, seguimiento en directo, estadísticas de hándicap, seguir a otros jugadores y compartir tarjetas de resultado. Interfaz *mobile-first* y trilingüe (català / español / english).

Producción: <https://pitchandclubs.cat>

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 7 (JavaScript, sin TypeScript) |
| UI | CSS a mano (inyectado en `App.jsx`), `lucide-react`, `html2canvas` |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Storage, Realtime, Edge Functions |
| Hosting | Vercel (SPA) |
| Auxiliar | Scraper de torneos en Python (`Scraper/`) |

## Requisitos

- **Node.js 20.19+ o 22.12+** (Vite 7 **no funciona** con Node 18 — falla con `crypto.hash is not a function`).
- npm.
- Un proyecto de Supabase con las tablas y funciones descritas más abajo.

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env en la raíz (ver más abajo) — OBLIGATORIO

# 3. Arrancar en desarrollo
npm run dev
```

El servidor de desarrollo se levanta en `http://localhost:5173`.

### Variables de entorno (`.env`)

El archivo `.env` **no está en el repo** (está en `.gitignore`) y es **obligatorio**: sin las claves de Supabase la app arranca pero falla en tiempo de ejecución al inicializar el cliente.

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
VITE_VAPID_PUBLIC_KEY=tu_clave_vapid_publica   # opcional — solo para notificaciones push
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (HMR) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | ESLint sobre todo el proyecto |

## Estructura

```
src/
├── App.jsx              # Raíz: estado global, routing por estado, CSS global, realtime
├── main.jsx             # Punto de entrada + registro del service worker
├── supabaseClient.js    # Cliente de Supabase
├── screens/             # Pantallas (Home, GameSetup, Scorecard, Summary, Ranking,
│                        #   Live, Tournaments, Shop, Profile, SharedGameRoute…)
├── components/          # Componentes reutilizables (AppHeader, BottomNav, AuthModal…)
├── data/                # constants.js (campos, tiers) e i18n.js (traducciones ca/es/en)
├── utils/helpers.js     # Puntuación (calcPCPoints), juego "Granada", helpers de formato
└── assets/

public/                  # Manifest PWA, service worker (sw.js), iconos, imágenes, SEO
supabase/
├── migrations/          # SQL de hardening (RLS, constraints, RPC)
└── functions/           # Edge Function notify-followers (push, Deno)
Scraper/                 # scraper.py — scrapea torneos de pitch.cat a Google Sheets
```

## Backend (Supabase)

- **Tablas**: `games`, `profiles`, `follows`, `push_subscriptions`, `tournaments`, `game_images`.
- **Auth**: email + Google OAuth.
- **Storage**: buckets `avatars` y `game-images`.
- **Realtime**: canal `games-feed` (INSERT/UPDATE de `games`) para el feed y las partidas en directo.
- **RLS + integridad**: `supabase/migrations/20260310_security_hardening.sql`.
- **RPC** (`SECURITY DEFINER`): `create_live_game`, `save_linked_game`.
- **Edge Function**: `notify-followers` (envía push a los seguidores al terminar una partida).

> Nota: el esquema base (`CREATE TABLE`, RPC `create_live_game`) no está completo en `migrations/`; parte vive en el dashboard de Supabase.

## Deploy

Vercel. `vercel.json` reescribe todas las rutas a `/` (SPA). Configura las variables `VITE_*` en el panel de Vercel.

## Scraper de torneos (opcional)

Herramienta independiente que vuelca los torneos de `pitch.cat` a una Google Sheet:

```bash
pip install requests beautifulsoup4 gspread google-auth
# Requiere un credentials.json de una service account de Google
python Scraper/scraper.py
```
