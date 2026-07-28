/* =========================================================================
 * Yumea Move — API comptes + progression + intégration Tsuno
 *
 * - Comptes créés directement dans Move (email + mot de passe, bcrypt).
 * - EMAIL = CLÉ DE FUSION : quand Tsuno relie un utilisateur (POST /tsuno/link),
 *   on retrouve le compte Move par email → même compte, données conservées.
 *   Un compte SSO (créé par Tsuno sans mot de passe) peut ensuite « réclamer »
 *   un mot de passe via /auth/register → toujours le même compte.
 * - Backend autonome (Fastify + SQLite), servi derrière move.yumea.fr/api/*.
 *   Le site statique n'est pas touché.
 * ========================================================================= */
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 4300);
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-change-me";
const TSUNO_API_KEY = process.env.TSUNO_API_KEY || "";
const DB_PATH = process.env.DB_PATH || "./app.db";

/* ---------------------------------------------------------------- base ---- */
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  tsuno_user_id TEXT UNIQUE,
  profile_json  TEXT,
  created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions(
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  date       TEXT NOT NULL,
  goal       TEXT,
  title      TEXT,
  minutes    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

/* ------------------------------------------------------------- helpers ---- */
const norm = (e) => String(e || "").trim().toLowerCase();
const nowIso = () => new Date().toISOString();
const makeToken = (u) => jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: "365d" });

/** Streak = jours consécutifs jusqu'à aujourd'hui (même algo que le client). */
function computeStats(userId) {
  const rows = db.prepare("SELECT date, minutes FROM sessions WHERE user_id=?").all(userId);
  const days = new Set(rows.map((r) => String(r.date).slice(0, 10)));
  const isoDay = (d) => d.toISOString().slice(0, 10);
  let streak = 0;
  const d = new Date();
  if (!days.has(isoDay(d))) d.setDate(d.getDate() - 1);
  while (days.has(isoDay(d))) { streak++; d.setDate(d.getDate() - 1); }
  const sessions = rows.length;
  const minutes = rows.reduce((s, r) => s + (r.minutes || 0), 0);
  const points = sessions * 10 + minutes;
  return { sessions, minutes, streak, points, activeDays: days.size };
}
const publicUser = (u) => ({ id: u.id, email: u.email, profile: u.profile_json ? JSON.parse(u.profile_json) : null });
const history = (uid) => db.prepare("SELECT date,goal,title,minutes FROM sessions WHERE user_id=? ORDER BY date").all(uid);

/* -------------------------------------------------------------- serveur --- */
const app = Fastify({ logger: false });
await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });

function auth(req, reply, done) {
  const m = (req.headers.authorization || "").match(/^Bearer (.+)$/);
  if (!m) return reply.code(401).send({ error: "no_token" });
  try { req.user = jwt.verify(m[1], JWT_SECRET); done(); }
  catch { return reply.code(401).send({ error: "bad_token" }); }
}
function tsunoGuard(req, reply, done) {
  const key = req.headers["x-tsuno-key"];
  if (!TSUNO_API_KEY || key !== TSUNO_API_KEY) return reply.code(401).send({ error: "bad_key" });
  done();
}

app.get("/api/v1/health", async () => ({ ok: true, ts: nowIso() }));

/* --- Auth --------------------------------------------------------------- */
app.post("/api/v1/auth/register", async (req, reply) => {
  const email = norm(req.body?.email);
  const password = req.body?.password || "";
  if (!email || !email.includes("@")) return reply.code(400).send({ error: "invalid_email" });
  if (password.length < 6) return reply.code(400).send({ error: "weak_password" });
  const existing = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (existing && existing.password_hash) return reply.code(409).send({ error: "email_taken" });
  const hash = bcrypt.hashSync(password, 10);
  let user;
  if (existing) {
    // compte SSO (Tsuno) sans mot de passe → il réclame un mot de passe, même compte
    db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(hash, existing.id);
    user = existing;
  } else {
    const id = randomUUID();
    db.prepare("INSERT INTO users(id,email,password_hash,created_at) VALUES(?,?,?,?)").run(id, email, hash, nowIso());
    user = { id, email };
  }
  return { token: makeToken(user), user: publicUser(db.prepare("SELECT * FROM users WHERE id=?").get(user.id)) };
});

app.post("/api/v1/auth/login", async (req, reply) => {
  const email = norm(req.body?.email);
  const password = req.body?.password || "";
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u || !u.password_hash || !bcrypt.compareSync(password, u.password_hash))
    return reply.code(401).send({ error: "bad_credentials" });
  return { token: makeToken(u), user: publicUser(u) };
});

app.get("/api/v1/me", { preHandler: auth }, async (req) => {
  const u = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.sub);
  return { user: publicUser(u), stats: computeStats(u.id), history: history(u.id) };
});

/* --- Progression -------------------------------------------------------- */
app.post("/api/v1/sessions", { preHandler: auth }, async (req) => {
  const { date, goal, title, minutes } = req.body || {};
  db.prepare("INSERT INTO sessions(id,user_id,date,goal,title,minutes,created_at) VALUES(?,?,?,?,?,?,?)")
    .run(randomUUID(), req.user.sub, date || nowIso(), goal || "", title || "", Math.round(minutes || 0), nowIso());
  return { ok: true, stats: computeStats(req.user.sub) };
});

/** Sync initial depuis le localStorage (à la 1re connexion) : fusion sans doublon. */
app.post("/api/v1/sessions/sync", { preHandler: auth }, async (req) => {
  const list = Array.isArray(req.body?.sessions) ? req.body.sessions : [];
  const existing = db.prepare("SELECT date,title FROM sessions WHERE user_id=?").all(req.user.sub);
  const seen = new Set(existing.map((e) => String(e.date).slice(0, 10) + "|" + e.title));
  const ins = db.prepare("INSERT INTO sessions(id,user_id,date,goal,title,minutes,created_at) VALUES(?,?,?,?,?,?,?)");
  const tx = db.transaction((items) => {
    for (const s of items) {
      const k = String(s.date || "").slice(0, 10) + "|" + (s.title || "");
      if (seen.has(k)) continue;
      seen.add(k);
      ins.run(randomUUID(), req.user.sub, s.date || nowIso(), s.goal || "", s.title || "", Math.round(s.minutes || 0), nowIso());
    }
  });
  tx(list);
  return { ok: true, stats: computeStats(req.user.sub), history: history(req.user.sub) };
});

app.put("/api/v1/profile", { preHandler: auth }, async (req) => {
  db.prepare("UPDATE users SET profile_json=? WHERE id=?").run(JSON.stringify(req.body || {}), req.user.sub);
  return { ok: true };
});

/* --- Intégration Tsuno (serveur-à-serveur, protégé par clé) -------------- */
// Relie/rattrape un utilisateur Tsuno au compte Move de MÊME EMAIL (fusion).
app.post("/api/v1/tsuno/link", { preHandler: tsunoGuard }, async (req, reply) => {
  const email = norm(req.body?.email);
  const tsunoUserId = String(req.body?.tsunoUserId || "");
  if (!email || !email.includes("@") || !tsunoUserId) return reply.code(400).send({ error: "missing_fields" });
  let u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u) {
    const id = randomUUID();
    db.prepare("INSERT INTO users(id,email,tsuno_user_id,created_at) VALUES(?,?,?,?)").run(id, email, tsunoUserId, nowIso());
    u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  } else if (!u.tsuno_user_id) {
    db.prepare("UPDATE users SET tsuno_user_id=? WHERE id=?").run(tsunoUserId, u.id);
  }
  return { userId: u.id, email: u.email, linked: true, summary: computeStats(u.id) };
});

// Lecture des points par Tsuno (id Move OU id Tsuno).
app.get("/api/v1/tsuno/users/:id/summary", { preHandler: tsunoGuard }, async (req, reply) => {
  const u = db.prepare("SELECT id FROM users WHERE id=? OR tsuno_user_id=?").get(req.params.id, req.params.id);
  if (!u) return reply.code(404).send({ error: "not_found" });
  return { userId: u.id, summary: computeStats(u.id) };
});

app.listen({ port: PORT, host: "127.0.0.1" })
  .then(() => console.log(`yumea-move-api écoute sur 127.0.0.1:${PORT}`))
  .catch((e) => { console.error(e); process.exit(1); });
