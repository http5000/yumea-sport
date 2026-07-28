# Yumea Move — API

API comptes + progression + intégration Tsuno. Node (Fastify) + SQLite.
Servie derrière `https://move.yumea.fr/api/*` (reverse proxy Caddy → 127.0.0.1:4300).

## Lancer

```bash
cd server && npm install
DB_PATH=/root/yumea-move-data/app.db \
JWT_SECRET=... TSUNO_API_KEY=... PORT=4300 npm start
```

En prod : service systemd `yumea-move-api` (env dans `/root/yumea-move-data/.env`).

## Endpoints publics (app)

| Méthode | Route | Auth | Corps / retour |
|--------|-------|------|----------------|
| GET  | `/api/v1/health` | — | `{ ok }` |
| POST | `/api/v1/auth/register` | — | `{email,password}` → `{token,user}` |
| POST | `/api/v1/auth/login` | — | `{email,password}` → `{token,user}` |
| GET  | `/api/v1/me` | Bearer | `{user,stats,history}` |
| POST | `/api/v1/sessions` | Bearer | `{date,goal,title,minutes}` → `{stats}` |
| POST | `/api/v1/sessions/sync` | Bearer | `{sessions:[…]}` (fusion sans doublon) |
| PUT  | `/api/v1/profile` | Bearer | `{goal,level,duration}` |

`stats = { sessions, minutes, streak, points, activeDays }`.
Token JWT (365 j) → header `Authorization: Bearer <token>`.

## Intégration Tsuno (serveur-à-serveur, header `x-tsuno-key: <clé>`)

| Méthode | Route | Rôle |
|--------|-------|------|
| POST | `/api/v1/tsuno/link` | `{email,tsunoUserId}` → relie/rattrape le compte Move de même email (fusion), renvoie `{userId,summary}` |
| GET  | `/api/v1/tsuno/users/:id/summary` | points de l'utilisateur (id Move **ou** id Tsuno) |

**Fusion par email** : un utilisateur qui crée son compte dans Move puis se
connecte via Tsuno avec le même email retombe sur le **même compte** — les
données (séances, streak, points) sont conservées. Move reste la source de
vérité ; Tsuno lit les points via `summary`.
