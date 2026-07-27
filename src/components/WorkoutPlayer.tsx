"use client";

import { useEffect, useReducer, useRef } from "react";
import { EXERCISES, type Program } from "@/lib/data";
import { beep, say, playCue, initVoice, pauseVoice, resumeVoice, cancelVoice } from "@/lib/coach";
import { COACH } from "@/lib/phrases";

type Mode = "intro" | "work" | "rest" | "done";

/** Poster (1re image) dérivé de l'URL vidéo : /exercises/x.mp4 -> /exercises/x.jpg */
const poster = (media: string) => media.replace(/\.mp4$/, ".jpg");

/** Repère graphique sobre (silhouette) — remplace les emojis. */
function PoseMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4.2" r="2.1" />
      <path d="M12 6.6v7M12 8.5l-4.2 2M12 8.5l4.2 2M12 13.6l-3 6.4M12 13.6l3 6.4" />
    </svg>
  );
}

interface Engine {
  mode: Mode;
  index: number;
  remaining: number;
  paused: boolean;
  doneWork: number;
}

export default function WorkoutPlayer({
  program,
  onFinish,
}: {
  program: Program;
  onFinish: (reason?: "quit" | "done") => void;
}) {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const eng = useRef<Engine>({ mode: "intro", index: 0, remaining: 3, paused: false, doneWork: 0 });
  const blocks = program.blocks;
  const totalWork = useRef(blocks.reduce((s, b) => s + b.work, 0)).current;

  // --- Transitions ---
  const enterBlock = useRef<(i: number, mode: "work" | "rest") => void>((i, mode) => {
    const e = eng.current;
    const block = blocks[i];
    if (!block) return finish.current();
    if (mode === "rest" && block.rest <= 0) return enterBlock.current(i + 1, "work");

    e.index = i;
    e.mode = mode;
    e.remaining = mode === "work" ? block.work : block.rest;

    const ex = EXERCISES[block.exId];
    if (mode === "work") {
      say(COACH.lines.go(ex.voice ?? ex.name));
    } else {
      const next = blocks[i + 1];
      const nextEx = next ? EXERCISES[next.exId] : null;
      say(nextEx ? COACH.lines.rest(nextEx.voice ?? nextEx.name) : COACH.lines.restLast());
    }
    force();
  });

  const finish = useRef<() => void>(() => {
    eng.current.mode = "done";
    playCue("finish", COACH.lines.finish());
    beep(880, 0.15);
    window.setTimeout(() => beep(1174, 0.3), 160);
    force();
    onFinish("done");
  });

  // --- Boucle 1 s ---
  useEffect(() => {
    initVoice();
    const first = EXERCISES[blocks[0].exId];
    say(COACH.lines.intro(first.voice ?? first.name));

    const iv = window.setInterval(() => {
      const e = eng.current;
      if (e.paused || e.mode === "done") return;

      if (e.mode === "intro") {
        if (e.remaining > 1) beep(660);
        e.remaining -= 1;
        if (e.remaining <= 0) {
          beep(1046, 0.25);
          enterBlock.current(0, "work");
        } else force();
        return;
      }

      // work / rest
      e.remaining -= 1;
      if (e.mode === "work") {
        e.doneWork += 1;
        // Repères vocaux (clés traduisibles) : mi-parcours puis 10 s restantes.
        const w = blocks[e.index].work;
        if (blocks[e.index].phase !== "cooldown") {
          if (w >= 18 && e.remaining === Math.round(w / 2)) playCue("halfway", COACH.lines.halfway());
          else if (w >= 22 && e.remaining === 10) playCue("tenLeft", COACH.lines.tenLeft());
        }
      }
      if (e.remaining <= 3 && e.remaining > 0) beep(e.mode === "work" ? 700 : 520);

      if (e.remaining <= 0) {
        beep(e.mode === "work" ? 990 : 780, 0.2);
        if (e.mode === "work") enterBlock.current(e.index, "rest");
        else enterBlock.current(e.index + 1, "work");
      } else force();
    }, 1000);

    return () => { window.clearInterval(iv); cancelVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Contrôles ---
  const togglePause = () => {
    const e = eng.current;
    e.paused = !e.paused;
    if (e.paused) pauseVoice(); else resumeVoice();
    force();
  };
  const skip = () => {
    const e = eng.current;
    if (e.mode === "intro") { enterBlock.current(0, "work"); return; }
    if (e.mode === "work") enterBlock.current(e.index, "rest");
    else enterBlock.current(e.index + 1, "work");
  };
  const prev = () => {
    const e = eng.current;
    enterBlock.current(Math.max(0, e.index - 1), "work");
  };
  const quit = () => { cancelVoice(); onFinish("quit"); };

  // --- Rendu ---
  const e = eng.current;
  const block = blocks[e.index];
  const ex = block ? EXERCISES[block.exId] : null;
  const isWork = e.mode === "work";
  const isRest = e.mode === "rest";
  const isIntro = e.mode === "intro";
  const next = blocks[e.index + 1];
  const nextEx = next ? EXERCISES[next.exId] : null;

  const RING = 2 * Math.PI * 54;
  const total = isWork ? block?.work : isRest ? block?.rest : 3;
  const frac = total ? e.remaining / total : 0;

  const phaseTag = block
    ? block.phase === "warmup" ? "Échauffement"
    : block.phase === "cooldown" ? "Retour au calme"
    : `Tour ${block.round}/${block.rounds}`
    : "";

  return (
    <div className={`player${isRest ? " resting" : ""}`}>
      <div className="player-top">
        <button className="icon-btn" aria-label="Quitter" onClick={quit}>✕</button>
        <div className="player-title">{program.meta.goalIcon} {program.title}</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(100 * e.doneWork) / totalWork}%` }} />
      </div>

      <div className={`stage${isWork ? " stage-work" : ""}`}>
        {isIntro ? (
          <PoseMark className="intro-mark" />
        ) : isWork && ex ? (
          <>
            <div className="phase-tag">{phaseTag}</div>
            <div className="ex-illus">
              {ex.media ? (
                <video
                  key={ex.media}
                  src={ex.media}
                  poster={poster(ex.media)}
                  autoPlay muted loop playsInline preload="auto"
                />
              ) : (
                <PoseMark className="ph" />
              )}
            </div>
            <h2 className="ex-name">{ex.name}</h2>
            <p className="ex-cue">{ex.cue}</p>
            {/* Préchargement de la vidéo suivante : supprime le trou noir entre exercices */}
            {nextEx?.media && (
              <video className="prefetch-hidden" src={nextEx.media} preload="auto" muted playsInline aria-hidden="true" />
            )}
          </>
        ) : (
          <>
            <div className="phase-tag rest-tag">Repos</div>
            <div className="ex-illus rest-illus">
              {nextEx?.media ? (
                <video key={`rest-${nextEx.media}`} src={nextEx.media} poster={poster(nextEx.media)} autoPlay muted loop playsInline preload="auto" />
              ) : (
                <PoseMark className="ph" />
              )}
            </div>
            <h2 className="ex-name">Récupère</h2>
            <p className="ex-cue">{nextEx ? `Prochain : ${nextEx.name}` : "Bientôt fini !"}</p>
          </>
        )}
      </div>

      <div className="ring-wrap">
        <svg className="ring" viewBox="0 0 120 120">
          <circle className="ring-bg" cx="60" cy="60" r="54" />
          <circle
            className="ring-fg" cx="60" cy="60" r="54"
            style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - frac) }}
          />
        </svg>
        <div className="ring-center">
          <div className="ring-time">{e.remaining}</div>
          <div className="ring-label">{isIntro ? "Prêt ?" : isWork ? "GO" : "repos"}</div>
        </div>
      </div>

      <div className="player-controls">
        <button className="ctrl" aria-label="Précédent" onClick={prev}>⏮</button>
        <button className="ctrl ctrl-main" onClick={togglePause}>{e.paused ? "▶︎ Reprendre" : "⏸ Pause"}</button>
        <button className="ctrl" aria-label="Suivant" onClick={skip}>⏭</button>
      </div>
      <div className="up-next">
        {isIntro
          ? `Premier · ${(ex ?? EXERCISES[blocks[0].exId]).name}`
          : nextEx ? `À suivre · ${nextEx.name}` : "Dernier effort"}
      </div>
    </div>
  );
}
