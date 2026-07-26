/* =========================================================================
 * Yumea Move — Lecteur d'entraînement
 * Timer circulaire, compte à rebours "3,2,1", voix française (Web Speech API),
 * bips (Web Audio API), pause/skip. Aucune dépendance externe, tout offline.
 * ========================================================================= */

import { EXERCISES } from "./data.js";

/* ---------- Sons (Web Audio) : bips de décompte + gong de fin ---------- */
let audioCtx = null;
function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function beep(freq = 880, dur = 0.12, vol = 0.25) {
  try {
    const ctx = ac();
    const o = ctx.createOscillator();
    const gnode = ctx.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    gnode.gain.setValueAtTime(vol, ctx.currentTime);
    gnode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(gnode).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch (e) { /* audio indisponible */ }
}

/* ---------- Coach voice (SpeechSynthesis, browser-native, gratuit) ----------
 * Anglais pour l'instant. Aucune génération externe : c'est la synthèse du
 * navigateur, donc zéro crédit. La langue est centralisée dans VOICE_LANG. */
const VOICE_LANG = "en-US";
let coachVoice = null;
function loadVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const base = VOICE_LANG.slice(0, 2);
  coachVoice = voices.find(v => v.lang && v.lang.toLowerCase() === VOICE_LANG.toLowerCase())
    || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(base)) || null;
}
if (window.speechSynthesis) {
  loadVoice();
  speechSynthesis.onvoiceschanged = loadVoice;
}
function say(text, opts = {}) {
  if (!window.speechSynthesis || !PlayerSettings.voice) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANG;
    if (coachVoice) u.voice = coachVoice;
    u.rate = opts.rate || 1.0;
    u.pitch = opts.pitch || 1.0;
    speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

export const PlayerSettings = { voice: true, sound: true };

/* ---------- Le lecteur ---------- */
export class WorkoutPlayer {
  constructor(program, { root, onFinish }) {
    this.program = program;
    this.blocks = program.blocks;
    this.root = root;
    this.onFinish = onFinish;
    this.index = 0;
    this.mode = "work";      // "work" | "rest"
    this.remaining = 0;
    this.paused = false;
    this.tickHandle = null;
    this.startCountdown = 3;
    this.totalWork = this.blocks.reduce((s, b) => s + b.work, 0);
    this.doneWork = 0;
  }

  start() {
    this.renderShell();
    this.beginIntro();
  }

  beginIntro() {
    this.mode = "intro";
    let n = 3;
    const ex = EXERCISES[this.blocks[0].exId];
    say(`Get ready. First exercise: ${ex.name}.`);
    this.setCenter("Prêt ?", `Premier : ${ex.name}`, "3");
    const iv = setInterval(() => {
      if (this.paused) return;
      if (n > 0) {
        beep(660);
        this.setCenter("Prêt ?", `Premier : ${ex.name}`, String(n));
        n--;
      } else {
        clearInterval(iv);
        beep(1046, 0.25);
        this.enterBlock(0, "work");
      }
    }, 1000);
    this._introIv = iv;
  }

  enterBlock(i, mode) {
    this.index = i;
    this.mode = mode;
    const block = this.blocks[i];
    if (!block) return this.finish();

    if (mode === "rest" && block.rest <= 0) return this.enterBlock(i + 1, "work");

    this.remaining = mode === "work" ? block.work : block.rest;
    const ex = EXERCISES[block.exId];

    if (mode === "work") {
      say(`${ex.name}. Let's go!`);
    } else {
      const next = this.blocks[i + 1];
      const nextEx = next ? EXERCISES[next.exId] : null;
      say(nextEx ? `Rest. Next up: ${nextEx.name}.` : "Rest.");
    }

    this.renderBlock();
    this.runTimer();
  }

  runTimer() {
    clearInterval(this.tickHandle);
    this.tickHandle = setInterval(() => {
      if (this.paused) return;
      this.remaining--;

      if (this.mode === "work") this.doneWork++;

      if (this.remaining <= 3 && this.remaining > 0) beep(this.mode === "work" ? 700 : 520);
      this.updateTimerUI();

      if (this.remaining <= 0) {
        clearInterval(this.tickHandle);
        beep(this.mode === "work" ? 990 : 780, 0.2);
        if (this.mode === "work") {
          this.enterBlock(this.index, "rest");
        } else {
          this.enterBlock(this.index + 1, "work");
        }
      }
    }, 1000);
  }

  /* ---------- Contrôles ---------- */
  togglePause() {
    this.paused = !this.paused;
    if (this.paused) speechSynthesis && speechSynthesis.pause();
    else speechSynthesis && speechSynthesis.resume();
    const btn = this.root.querySelector("#ppBtn");
    if (btn) btn.textContent = this.paused ? "▶︎ Reprendre" : "⏸ Pause";
    this.root.querySelector(".player")?.classList.toggle("is-paused", this.paused);
  }
  skip() {
    clearInterval(this.tickHandle);
    if (this.mode === "work") this.enterBlock(this.index, "rest");
    else this.enterBlock(this.index + 1, "work");
  }
  prev() {
    clearInterval(this.tickHandle);
    const i = Math.max(0, this.index - 1);
    this.enterBlock(i, "work");
  }
  quit() {
    clearInterval(this.tickHandle);
    clearInterval(this._introIv);
    speechSynthesis && speechSynthesis.cancel();
  }

  finish() {
    clearInterval(this.tickHandle);
    say("Well done! Workout complete.");
    beep(880, 0.15); setTimeout(() => beep(1174, 0.3), 160);
    this.onFinish && this.onFinish();
  }

  /* ---------- Rendu ---------- */
  renderShell() {
    this.root.innerHTML = `
      <div class="player">
        <div class="player-top">
          <button class="icon-btn" id="quitBtn" aria-label="Quitter">✕</button>
          <div class="player-title">${this.program.meta.goalIcon} ${this.program.title}</div>
          <div style="width:40px"></div>
        </div>
        <div class="progress-track"><div class="progress-fill" id="sessProg"></div></div>

        <div class="stage" id="stage"></div>

        <div class="ring-wrap">
          <svg class="ring" viewBox="0 0 120 120">
            <circle class="ring-bg" cx="60" cy="60" r="54"/>
            <circle class="ring-fg" id="ringFg" cx="60" cy="60" r="54"/>
          </svg>
          <div class="ring-center">
            <div class="ring-time" id="ringTime">0</div>
            <div class="ring-label" id="ringLabel"></div>
          </div>
        </div>

        <div class="player-controls">
          <button class="ctrl" id="prevBtn" aria-label="Précédent">⏮</button>
          <button class="ctrl ctrl-main" id="ppBtn">⏸ Pause</button>
          <button class="ctrl" id="skipBtn" aria-label="Suivant">⏭</button>
        </div>
        <div class="up-next" id="upNext"></div>
      </div>`;

    this.root.querySelector("#quitBtn").onclick = () => { this.quit(); this.onFinish && this.onFinish("quit"); };
    this.root.querySelector("#ppBtn").onclick = () => this.togglePause();
    this.root.querySelector("#skipBtn").onclick = () => this.skip();
    this.root.querySelector("#prevBtn").onclick = () => this.prev();
    this._ringLen = 2 * Math.PI * 54;
    this.root.querySelector("#ringFg").style.strokeDasharray = this._ringLen;
  }

  setCenter(label, sub, big) {
    const stage = this.root.querySelector("#stage");
    if (stage) stage.innerHTML = `<div class="intro-emoji">🔥</div>`;
    this.root.querySelector("#ringLabel").textContent = label;
    this.root.querySelector("#ringTime").textContent = big;
    this.root.querySelector("#upNext").textContent = sub;
  }

  renderBlock() {
    const block = this.blocks[this.index];
    const ex = EXERCISES[block.exId];
    const stage = this.root.querySelector("#stage");
    const isWork = this.mode === "work";
    const next = this.blocks[this.index + 1];
    const nextEx = next ? EXERCISES[next.exId] : null;

    const phaseTag = block.phase === "warmup" ? "Échauffement"
      : block.phase === "cooldown" ? "Retour au calme"
      : `Tour ${block.round}/${block.rounds}`;

    stage.className = "stage " + (isWork ? "stage-work" : "stage-rest");
    stage.innerHTML = isWork
      ? `
        <div class="phase-tag">${phaseTag}</div>
        <div class="ex-illus">${ex.media ? `<video src="${ex.media}" autoplay muted loop playsinline></video>` : `<span class="ex-emoji">${ex.emoji}</span>`}</div>
        <h2 class="ex-name">${ex.name}</h2>
        <p class="ex-cue">${ex.cue}</p>`
      : `
        <div class="phase-tag rest-tag">Repos</div>
        <div class="ex-illus rest-illus"><span class="ex-emoji">😮‍💨</span></div>
        <h2 class="ex-name">Récupère</h2>
        <p class="ex-cue">${nextEx ? "Prochain : " + nextEx.name : "Bientôt fini !"}</p>`;

    this.root.querySelector("#ringLabel").textContent = isWork ? "GO" : "repos";
    this.root.querySelector(".player").classList.toggle("resting", !isWork);
    this.root.querySelector("#upNext").textContent = nextEx ? `À suivre · ${nextEx.emoji} ${nextEx.name}` : "Dernier effort 💪";
    this.updateTimerUI();
  }

  updateTimerUI() {
    const block = this.blocks[this.index];
    const total = this.mode === "work" ? block.work : block.rest;
    this.root.querySelector("#ringTime").textContent = this.remaining;
    const frac = total ? this.remaining / total : 0;
    const fg = this.root.querySelector("#ringFg");
    if (fg) fg.style.strokeDashoffset = this._ringLen * (1 - frac);
    const prog = this.root.querySelector("#sessProg");
    if (prog) prog.style.width = (100 * this.doneWork / this.totalWork) + "%";
  }
}
