"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GOALS, LEVELS, DURATIONS, EXERCISES, generateProgram,
  type Program, type ProfileDraft,
} from "@/lib/data";
import { store, computeStreak, lastSevenDays, type Session, type Settings } from "@/lib/store";
import { setAudioPrefs } from "@/lib/coach";
import { QUICK_SESSIONS, DEFAULT_PROFILE, type QuickSession } from "@/lib/config";
import WorkoutPlayer from "@/components/WorkoutPlayer";

type Screen = "home" | "onboarding" | "preview" | "play" | "done" | "progress";

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [draft, setDraft] = useState<ProfileDraft>(DEFAULT_PROFILE);
  const [program, setProgram] = useState<Program | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings>(store.getSettings());
  const [ready, setReady] = useState(false);

  // Hydratation depuis localStorage (client uniquement)
  useEffect(() => {
    const p = store.getProfile();
    if (p) setDraft(p);
    setHistory(store.getHistory());
    const s = store.getSettings();
    setSettings(s);
    setAudioPrefs(s);
    setReady(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const streak = useMemo(() => computeStreak(history), [history]);
  const totalMin = useMemo(() => history.reduce((a, h) => a + (h.minutes || 0), 0), [history]);

  function build(next: ProfileDraft) {
    const seed = Math.floor(Math.random() * 1e6);
    setProgram(generateProgram({ ...next, seed }));
    setScreen("preview");
  }
  function updateSetting(key: keyof Settings, value: boolean) {
    const s = { ...settings, [key]: value };
    setSettings(s); store.setSettings(s); setAudioPrefs(s);
  }
  function onFinish(reason?: "quit" | "done") {
    if (reason === "quit" || !program) { setScreen("home"); return; }
    const s: Session = { date: new Date().toISOString(), goal: program.goal, title: program.title, minutes: program.meta.estMin };
    store.addSession(s);
    setHistory(store.getHistory());
    setScreen("done");
  }

  if (!ready) return <div className="app-root" />;

  if (screen === "play" && program) {
    return <WorkoutPlayer program={program} onFinish={onFinish} />;
  }

  return (
    <div className="app-root">
      {screen === "home" && (
        <Home streak={streak} count={history.length} totalMin={totalMin}
          onGenerate={() => setScreen("onboarding")}
          onQuick={(q) => { const d = { goal: q.goal, level: q.level, duration: q.duration }; setDraft(d); build(d); }}
          onNav={setScreen} />
      )}

      {screen === "onboarding" && (
        <Onboarding draft={draft} settings={settings}
          onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          onSetting={updateSetting}
          onBack={() => setScreen("home")}
          onNav={setScreen}
          onGenerate={() => { store.setProfile(draft); build(draft); }} />
      )}

      {screen === "preview" && program && (
        <Preview program={program}
          onBack={() => setScreen("onboarding")}
          onStart={() => setScreen("play")}
          onRegen={() => build(draft)} />
      )}

      {screen === "done" && (
        <Done streak={streak} onHome={() => setScreen("home")} onAgain={() => setScreen("onboarding")} />
      )}

      {screen === "progress" && (
        <Progress history={history} streak={streak} totalMin={totalMin}
          onBack={() => setScreen("home")} onNav={setScreen} />
      )}
    </div>
  );
}

/* ------------------------------ Navigation ------------------------------ */
function Nav({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const Item = ({ id, icon, label }: { id: Screen; icon: string; label: string }) => (
    <button className={`nav-item${active === id ? " active" : ""}`} onClick={() => onNav(id)}>
      <span>{icon}</span><small>{label}</small>
    </button>
  );
  return (
    <nav className="bottom-nav">
      <Item id="home" icon="🏠" label="Accueil" />
      <Item id="onboarding" icon="✨" label="Générer" />
      <Item id="progress" icon="📈" label="Progrès" />
    </nav>
  );
}

/* ------------------------------ Accueil ------------------------------ */
function Home({ streak, count, totalMin, onGenerate, onQuick, onNav }: {
  streak: number; count: number; totalMin: number;
  onGenerate: () => void; onQuick: (q: QuickSession) => void; onNav: (s: Screen) => void;
}) {
  return (
    <>
      <header className="hero">
        <div className="hero-brand">Yumea <span>Move</span></div>
        <p className="hero-sub">Bouge un peu, souvent. {count > 0 ? "Content de te revoir 👋" : "Prêt·e à commencer ?"}</p>
        <div className="streak-row">
          <div className="stat-chip"><b>{streak}</b><span>🔥 jours d&apos;affilée</span></div>
          <div className="stat-chip"><b>{count}</b><span>séances</span></div>
          <div className="stat-chip"><b>{totalMin}</b><span>min actives</span></div>
        </div>
      </header>
      <section className="section">
        <button className="cta" onClick={onGenerate}>✨ Générer ma séance</button>
      </section>
      <section className="section">
        <h3 className="section-title">Séances express</h3>
        <div className="card-grid">
          {QUICK_SESSIONS.map((q, i) => (
            <button key={i} className="quick-card" onClick={() => onQuick(q)}>
              <span className="quick-icon">{q.icon}</span>
              <span className="quick-tag">{q.tag}</span>
              <span className="quick-meta">{GOALS[q.goal].label} · {q.duration} min</span>
            </button>
          ))}
        </div>
      </section>
      <Nav active="home" onNav={onNav} />
    </>
  );
}

/* ------------------------------ Onboarding ------------------------------ */
function Onboarding({ draft, settings, onChange, onSetting, onBack, onNav, onGenerate }: {
  draft: ProfileDraft; settings: Settings;
  onChange: (p: Partial<ProfileDraft>) => void;
  onSetting: (k: keyof Settings, v: boolean) => void;
  onBack: () => void; onNav: (s: Screen) => void; onGenerate: () => void;
}) {
  return (
    <>
      <header className="page-head">
        <button className="back" onClick={onBack}>‹ Retour</button>
        <h2>Ta séance sur mesure</h2>
      </header>
      <section className="section">
        <h3 className="section-title">Ton objectif</h3>
        <div className="opt-grid">
          {Object.entries(GOALS).map(([id, g]) => (
            <button key={id} className={`opt${draft.goal === id ? " sel" : ""}`} onClick={() => onChange({ goal: id })}>
              <span className="opt-icon">{g.icon}</span><b>{g.label}</b><small>{g.desc}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="section">
        <h3 className="section-title">Ton niveau</h3>
        <div className="pill-row">
          {Object.entries(LEVELS).map(([id, l]) => (
            <button key={id} className={`pill${draft.level === id ? " sel" : ""}`} onClick={() => onChange({ level: id })}>{l.label}</button>
          ))}
        </div>
      </section>
      <section className="section">
        <h3 className="section-title">Durée</h3>
        <div className="pill-row">
          {DURATIONS.map((d) => (
            <button key={d} className={`pill${draft.duration === d ? " sel" : ""}`} onClick={() => onChange({ duration: d })}>{d} min</button>
          ))}
        </div>
      </section>
      <section className="section">
        <label className="toggle"><input type="checkbox" checked={settings.voice} onChange={(e) => onSetting("voice", e.target.checked)} /> Coach vocal (Pauline, français)</label>
        <label className="toggle"><input type="checkbox" checked={settings.sound} onChange={(e) => onSetting("sound", e.target.checked)} /> Bips de décompte</label>
      </section>
      <section className="section">
        <button className="cta" onClick={onGenerate}>Générer mon programme →</button>
      </section>
      <Nav active="onboarding" onNav={onNav} />
    </>
  );
}

/* ------------------------------ Aperçu ------------------------------ */
function Preview({ program, onBack, onStart, onRegen }: {
  program: Program; onBack: () => void; onStart: () => void; onRegen: () => void;
}) {
  return (
    <>
      <header className="page-head">
        <button className="back" onClick={onBack}>‹ Modifier</button>
        <h2>{program.meta.goalIcon} {program.title}</h2>
      </header>
      <section className="section">
        <div className="prog-meta">
          <div><b>{program.meta.estMin}</b><span>min</span></div>
          <div><b>{program.blocks.length}</b><span>exercices</span></div>
          <div><b>{program.meta.rounds}</b><span>tours</span></div>
          <div><b>{program.meta.levelLabel}</b><span>niveau</span></div>
        </div>
      </section>
      <section className="section">
        <div className="ex-list">
          {program.blocks.map((b, i) => {
            const ex = EXERCISES[b.exId];
            const badge = b.phase === "warmup" ? "Échauffement" : b.phase === "cooldown" ? "Étirement" : `${b.work}s`;
            return (
              <div className="ex-row" key={i}>
                <span className="ex-row-emoji">{ex.emoji}</span>
                <div className="ex-row-txt"><b>{ex.name}</b><small>{ex.cue}</small></div>
                <span className="ex-row-badge">{badge}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="section sticky-cta">
        <button className="cta" onClick={onStart}>▶︎ Démarrer la séance</button>
        <button className="cta ghost" onClick={onRegen}>🔀 Une autre variante</button>
      </section>
    </>
  );
}

/* ------------------------------ Fin ------------------------------ */
function Done({ streak, onHome, onAgain }: { streak: number; onHome: () => void; onAgain: () => void }) {
  return (
    <div className="done">
      <div className="done-emoji">🎉</div>
      <h1>Séance terminée !</h1>
      <p>Bien joué. Chaque séance compte.</p>
      <div className="streak-big">🔥 {streak} jour{streak > 1 ? "s" : ""} d&apos;affilée</div>
      <button className="cta" onClick={onHome}>Retour à l&apos;accueil</button>
      <button className="cta ghost" onClick={onAgain}>Refaire une séance</button>
    </div>
  );
}

/* ------------------------------ Progrès ------------------------------ */
function Progress({ history, streak, totalMin, onBack, onNav }: {
  history: Session[]; streak: number; totalMin: number; onBack: () => void; onNav: (s: Screen) => void;
}) {
  const week = lastSevenDays(history);
  const list = [...history].reverse().slice(0, 30);
  return (
    <>
      <header className="page-head"><button className="back" onClick={onBack}>‹ Retour</button><h2>Mes progrès</h2></header>
      <section className="section">
        <div className="streak-row">
          <div className="stat-chip"><b>{streak}</b><span>🔥 série</span></div>
          <div className="stat-chip"><b>{history.length}</b><span>séances</span></div>
          <div className="stat-chip"><b>{totalMin}</b><span>min</span></div>
        </div>
      </section>
      <section className="section">
        <h3 className="section-title">Cette semaine</h3>
        <div className="week-row">
          {week.map((d, i) => (
            <div key={i} className={`day${d.active ? " on" : ""}`}><span>{d.label}</span><i>{d.active ? "✓" : ""}</i></div>
          ))}
        </div>
      </section>
      <section className="section">
        <h3 className="section-title">Historique</h3>
        {list.length ? (
          <div className="ex-list">
            {list.map((x, i) => (
              <div className="ex-row" key={i}>
                <span className="ex-row-emoji">{GOALS[x.goal]?.icon || "🏃"}</span>
                <div className="ex-row-txt"><b>{x.title}</b><small>{new Date(x.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</small></div>
                <span className="ex-row-badge">{x.minutes} min</span>
              </div>
            ))}
          </div>
        ) : <p className="empty">Pas encore de séance. Lance-toi ! 💪</p>}
      </section>
      <Nav active="progress" onNav={onNav} />
    </>
  );
}
