"use client";

import { useEffect, useReducer, useRef } from "react";
import { EXERCISES, type Program } from "@/lib/data";
import { beep, say, initVoice, pauseVoice, resumeVoice, cancelVoice } from "@/lib/coach";

type Mode = "intro" | "work" | "rest" | "done";

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
      say(`${ex.voice ?? ex.name}. Let's go!`);
    } else {
      const next = blocks[i + 1];
      const nextEx = next ? EXERCISES[next.exId] : null;
      say(nextEx ? `Rest. Next up: ${nextEx.voice ?? nextEx.name}.` : "Rest.");
    }
    force();
  });

  const finish = useRef<() => void>(() => {
    eng.current.mode = "done";
    say("Well done! Workout complete.");
    beep(880, 0.15);
    window.setTimeout(() => beep(1174, 0.3), 160);
    force();
    onFinish("done");
  });

  // --- Boucle 1 s ---
  useEffect(() => {
    initVoice();
    const first = EXERCISES[blocks[0].exId];
    say(`Get ready. First exercise: ${first.voice ?? first.name}.`);

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
      if (e.mode === "work") e.doneWork += 1;
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
          <div className="intro-emoji">🔥</div>
        ) : isWork && ex ? (
          <>
            <div className="phase-tag">{phaseTag}</div>
            <div className="ex-illus">
              {ex.media ? (
                <video src={ex.media} autoPlay muted loop playsInline />
              ) : (
                <span className="ex-emoji">{ex.emoji}</span>
              )}
            </div>
            <h2 className="ex-name">{ex.name}</h2>
            <p className="ex-cue">{ex.cue}</p>
          </>
        ) : (
          <>
            <div className="phase-tag rest-tag">Repos</div>
            <div className="ex-illus rest-illus"><span className="ex-emoji">😮‍💨</span></div>
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
          ? `Premier · ${(ex ?? EXERCISES[blocks[0].exId]).emoji} ${(ex ?? EXERCISES[blocks[0].exId]).name}`
          : nextEx ? `À suivre · ${nextEx.emoji} ${nextEx.name}` : "Dernier effort 💪"}
      </div>
    </div>
  );
}
