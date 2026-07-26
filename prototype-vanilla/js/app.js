/* =========================================================================
 * Yumea Move — Contrôleur de l'application (SPA sans framework)
 * ========================================================================= */

import { GOALS, LEVELS, DURATIONS, generateProgram } from "./data.js";
import { WorkoutPlayer, PlayerSettings } from "./player.js";

const app = document.getElementById("app");

/* ---------- Stockage local ---------- */
const store = {
  get profile() { return JSON.parse(localStorage.getItem("ym_profile") || "null"); },
  set profile(v) { localStorage.setItem("ym_profile", JSON.stringify(v)); },
  get history() { return JSON.parse(localStorage.getItem("ym_history") || "[]"); },
  addSession(s) {
    const h = this.history; h.push(s);
    localStorage.setItem("ym_history", JSON.stringify(h));
  },
  get settings() { return JSON.parse(localStorage.getItem("ym_settings") || '{"voice":true,"sound":true}'); },
  set settings(v) { localStorage.setItem("ym_settings", JSON.stringify(v)); },
};

// applique les réglages son/voix
const s = store.settings;
PlayerSettings.voice = s.voice;
PlayerSettings.sound = s.sound;

/* ---------- Calcul de la série (streak) ---------- */
function computeStreak() {
  const days = new Set(store.history.map(h => h.date.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  // tolère "aujourd'hui pas encore fait" en partant d'hier si besoin
  if (!days.has(iso(d))) d.setDate(d.getDate() - 1);
  while (days.has(iso(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function iso(d) { return d.toISOString().slice(0, 10); }

/* ---------- État courant ---------- */
let draft = { goal: "full_body", level: "debutant", duration: 10 };
let currentProgram = null;
let player = null;

/* ============================ ROUTES ============================ */
function render() {
  const hash = location.hash || "#/";
  const [, route] = hash.split("#/");
  const base = (route || "").split("?")[0];

  if (base === "onboarding") return viewOnboarding();
  if (base === "preview") return viewPreview();
  if (base === "play") return viewPlay();
  if (base === "done") return viewDone();
  if (base === "progress") return viewProgress();
  return viewHome();
}
window.addEventListener("hashchange", render);

/* ---------- Barre de navigation ---------- */
function nav(active) {
  const item = (id, icon, label) =>
    `<a href="#/${id}" class="nav-item ${active === id ? "active" : ""}">
       <span>${icon}</span><small>${label}</small></a>`;
  return `<nav class="bottom-nav">
    ${item("", "🏠", "Accueil")}
    ${item("onboarding", "✨", "Générer")}
    ${item("progress", "📈", "Progrès")}
  </nav>`;
}

/* ============================ ACCUEIL ============================ */
function viewHome() {
  const profile = store.profile;
  const streak = computeStreak();
  const count = store.history.length;
  const totalMin = store.history.reduce((a, h) => a + (h.minutes || 0), 0);

  // suggestions rapides
  const quick = [
    { goal: "cardio", level: "debutant", duration: 5, tag: "Réveil express", icon: "⚡" },
    { goal: "fessiers", level: "intermediaire", duration: 10, tag: "Spécial fessiers", icon: "🍑" },
    { goal: "ventre", level: "debutant", duration: 10, tag: "Gainage du ventre", icon: "🎯" },
    { goal: "mobilite", level: "debutant", duration: 5, tag: "Pause détente", icon: "🧘" },
  ];

  app.innerHTML = `
    <header class="hero">
      <div class="hero-brand">Yumea <span>Move</span></div>
      <p class="hero-sub">Bouge un peu, souvent. ${profile ? "Content de te revoir 👋" : "Prêt·e à commencer ?"}</p>
      <div class="streak-row">
        <div class="stat-chip"><b>${streak}</b><span>🔥 jours d'affilée</span></div>
        <div class="stat-chip"><b>${count}</b><span>séances</span></div>
        <div class="stat-chip"><b>${totalMin}</b><span>min actives</span></div>
      </div>
    </header>

    <section class="section">
      <button class="cta" onclick="location.hash='#/onboarding'">✨ Générer ma séance</button>
    </section>

    <section class="section">
      <h3 class="section-title">Séances express</h3>
      <div class="card-grid">
        ${quick.map((q, i) => `
          <button class="quick-card" data-i="${i}">
            <span class="quick-icon">${q.icon}</span>
            <span class="quick-tag">${q.tag}</span>
            <span class="quick-meta">${GOALS[q.goal].label} · ${q.duration} min</span>
          </button>`).join("")}
      </div>
    </section>

    ${nav("")}
  `;

  app.querySelectorAll(".quick-card").forEach(btn => {
    btn.onclick = () => {
      const q = quick[+btn.dataset.i];
      draft = { goal: q.goal, level: q.level, duration: q.duration };
      buildAndPreview();
    };
  });
}

/* ============================ ONBOARDING ============================ */
function viewOnboarding() {
  app.innerHTML = `
    <header class="page-head">
      <button class="back" onclick="location.hash='#/'">‹ Retour</button>
      <h2>Ta séance sur mesure</h2>
    </header>

    <section class="section">
      <h3 class="section-title">Ton objectif</h3>
      <div class="opt-grid">
        ${Object.entries(GOALS).map(([id, g]) => `
          <button class="opt ${draft.goal === id ? "sel" : ""}" data-k="goal" data-v="${id}">
            <span class="opt-icon">${g.icon}</span>
            <b>${g.label}</b><small>${g.desc}</small>
          </button>`).join("")}
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Ton niveau</h3>
      <div class="pill-row">
        ${Object.entries(LEVELS).map(([id, l]) => `
          <button class="pill ${draft.level === id ? "sel" : ""}" data-k="level" data-v="${id}">${l.label}</button>`).join("")}
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Durée</h3>
      <div class="pill-row">
        ${DURATIONS.map(d => `
          <button class="pill ${draft.duration === d ? "sel" : ""}" data-k="duration" data-v="${d}">${d} min</button>`).join("")}
      </div>
    </section>

    <section class="section">
      <label class="toggle"><input type="checkbox" id="tglVoice" ${PlayerSettings.voice ? "checked" : ""}/> Coach vocal (anglais)</label>
      <label class="toggle"><input type="checkbox" id="tglSound" ${PlayerSettings.sound ? "checked" : ""}/> Bips de décompte</label>
    </section>

    <section class="section">
      <button class="cta" id="genBtn">Générer mon programme →</button>
    </section>
    ${nav("onboarding")}
  `;

  app.querySelectorAll(".opt, .pill").forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.k;
      draft[k] = k === "duration" ? +btn.dataset.v : btn.dataset.v;
      viewOnboarding();
    };
  });
  app.querySelector("#tglVoice").onchange = e => { PlayerSettings.voice = e.target.checked; store.settings = { ...store.settings, voice: e.target.checked }; };
  app.querySelector("#tglSound").onchange = e => { PlayerSettings.sound = e.target.checked; store.settings = { ...store.settings, sound: e.target.checked }; };
  app.querySelector("#genBtn").onclick = () => { store.profile = draft; buildAndPreview(); };
}

function buildAndPreview() {
  const seed = Math.floor(Math.random() * 1e6);
  currentProgram = generateProgram({ ...draft, seed });
  location.hash = "#/preview";
}

/* ============================ APERÇU ============================ */
function viewPreview() {
  if (!currentProgram) return (location.hash = "#/onboarding");
  const p = currentProgram;
  const items = p.blocks.filter(b => b.phase !== "warmup" || true); // affiche tout

  app.innerHTML = `
    <header class="page-head">
      <button class="back" onclick="location.hash='#/onboarding'">‹ Modifier</button>
      <h2>${p.meta.goalIcon} ${p.title}</h2>
    </header>

    <section class="section">
      <div class="prog-meta">
        <div><b>${p.meta.estMin}</b><span>min</span></div>
        <div><b>${p.blocks.length}</b><span>exercices</span></div>
        <div><b>${p.meta.rounds}</b><span>tours</span></div>
        <div><b>${p.meta.levelLabel}</b><span>niveau</span></div>
      </div>
    </section>

    <section class="section">
      <div class="ex-list">
        ${items.map(b => {
          const ex = getEx(b.exId);
          const badge = b.phase === "warmup" ? "Échauffement" : b.phase === "cooldown" ? "Étirement" : `${b.work}s`;
          return `<div class="ex-row">
            <span class="ex-row-emoji">${ex.emoji}</span>
            <div class="ex-row-txt"><b>${ex.name}</b><small>${ex.cue}</small></div>
            <span class="ex-row-badge">${badge}</span>
          </div>`;
        }).join("")}
      </div>
    </section>

    <section class="section sticky-cta">
      <button class="cta" id="startBtn">▶︎ Démarrer la séance</button>
      <button class="cta ghost" id="regenBtn">🔀 Une autre variante</button>
    </section>
  `;
  app.querySelector("#startBtn").onclick = () => (location.hash = "#/play");
  app.querySelector("#regenBtn").onclick = () => buildAndPreview();
}

// import paresseux des exercices pour l'aperçu
import { EXERCISES } from "./data.js";
function getEx(id) { return EXERCISES[id]; }

/* ============================ LECTEUR ============================ */
function viewPlay() {
  if (!currentProgram) return (location.hash = "#/");
  app.innerHTML = `<div id="playerRoot"></div>`;
  const root = document.getElementById("playerRoot");
  player = new WorkoutPlayer(currentProgram, {
    root,
    onFinish: (reason) => {
      if (reason === "quit") { location.hash = "#/"; return; }
      store.addSession({
        date: new Date().toISOString(),
        goal: currentProgram.goal,
        title: currentProgram.title,
        minutes: currentProgram.meta.estMin,
      });
      location.hash = "#/done";
    },
  });
  player.start();
}

/* ============================ FIN DE SÉANCE ============================ */
function viewDone() {
  const streak = computeStreak();
  app.innerHTML = `
    <div class="done">
      <div class="done-emoji">🎉</div>
      <h1>Séance terminée !</h1>
      <p>Bien joué. Chaque séance compte.</p>
      <div class="streak-big">🔥 ${streak} jour${streak > 1 ? "s" : ""} d'affilée</div>
      <button class="cta" onclick="location.hash='#/'">Retour à l'accueil</button>
      <button class="cta ghost" onclick="location.hash='#/onboarding'">Refaire une séance</button>
    </div>`;
}

/* ============================ PROGRÈS ============================ */
function viewProgress() {
  const h = [...store.history].reverse();
  const streak = computeStreak();
  const totalMin = store.history.reduce((a, x) => a + (x.minutes || 0), 0);

  // 7 derniers jours
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = iso(d);
    const active = store.history.some(x => x.date.slice(0, 10) === key);
    week.push({ label: ["D", "L", "M", "M", "J", "V", "S"][d.getDay()], active });
  }

  app.innerHTML = `
    <header class="page-head"><button class="back" onclick="location.hash='#/'">‹ Retour</button><h2>Mes progrès</h2></header>

    <section class="section">
      <div class="streak-row">
        <div class="stat-chip"><b>${streak}</b><span>🔥 série</span></div>
        <div class="stat-chip"><b>${store.history.length}</b><span>séances</span></div>
        <div class="stat-chip"><b>${totalMin}</b><span>min</span></div>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Cette semaine</h3>
      <div class="week-row">
        ${week.map(d => `<div class="day ${d.active ? "on" : ""}"><span>${d.label}</span><i>${d.active ? "✓" : ""}</i></div>`).join("")}
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Historique</h3>
      ${h.length ? `<div class="ex-list">${h.slice(0, 30).map(x => `
        <div class="ex-row">
          <span class="ex-row-emoji">${(GOALS[x.goal] || {}).icon || "🏃"}</span>
          <div class="ex-row-txt"><b>${x.title}</b><small>${new Date(x.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</small></div>
          <span class="ex-row-badge">${x.minutes} min</span>
        </div>`).join("")}</div>`
        : `<p class="empty">Pas encore de séance. Lance-toi ! 💪</p>`}
    </section>
    ${nav("progress")}
  `;
}

/* ---------- Enregistrement du service worker (PWA) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
