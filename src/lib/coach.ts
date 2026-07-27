/* Coach audio : voix (SpeechSynthesis navigateur) + bips (Web Audio).
 * 100 % côté navigateur → zéro coût, hors-ligne. Anglais pour l'instant
 * (VOICE_LANG). Le jour où on veut une vraie voix humaine, on remplace `say`
 * par la lecture d'un fichier audio pré-généré, sans changer les appels. */

import { COACH } from "./phrases";

/** Langue de synthèse = celle du pack de répliques actif (voir phrases.ts). */
export const VOICE_LANG = COACH.lang;

let audioCtx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

let soundOn = true;
let voiceOn = true;
export function setAudioPrefs(prefs: { sound?: boolean; voice?: boolean }) {
  if (prefs.sound !== undefined) soundOn = prefs.sound;
  if (prefs.voice !== undefined) voiceOn = prefs.voice;
}

export function beep(freq = 880, dur = 0.12, vol = 0.25) {
  if (!soundOn) return;
  const ctx = ac(); if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq; o.type = "sine";
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* audio indisponible */ }
}

let coachVoice: SpeechSynthesisVoice | null = null;
function loadVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = speechSynthesis.getVoices();
  const base = VOICE_LANG.slice(0, 2);
  coachVoice =
    voices.find((v) => v.lang?.toLowerCase() === VOICE_LANG.toLowerCase()) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith(base)) || null;
}
export function initVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  loadVoice();
  speechSynthesis.onvoiceschanged = loadVoice;
}

export function say(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANG;
    if (coachVoice) u.voice = coachVoice;
    u.rate = opts.rate ?? 1.0;
    u.pitch = opts.pitch ?? 1.0;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

/* --- Doublage humain pré-généré (voix Pauline FR), DISSOCIÉ de la vidéo ---
 * Chaque réplique = un fichier public/audio/fr/<clé>.mp3. Les répliques qui
 * annoncent un exercice sont paramétrées par son id : <clé>_<exId>.mp3
 * (ex. go_squats.mp3, intro_squats.mp3, rest_pompes.mp3). Les autres sont
 * fixes : halfway.mp3, tenLeft.mp3, restLast.mp3, finish.mp3.
 *
 * VOICE_MODE = "pauline" -> on lit le clip ; s'il manque, repli synthèse.
 * VOICE_MODE = "browser" -> synthèse navigateur (état actuel, tant que le
 * doublage n'est pas 100 % en ligne). On bascule les deux (ici + COACH dans
 * phrases.ts) le jour de la mise en ligne des clips. */
const AUDIO_DIR = "/audio/fr";
export const VOICE_MODE: "browser" | "pauline" = "browser";

/** Répliques dont le clip dépend de l'exercice annoncé. */
const PER_EX_KEYS = new Set<string>(["go", "intro", "rest"]);

let cueAudio: HTMLAudioElement | null = null;

/**
 * Prononce une réplique du coach par sa CLÉ (jamais une chaîne en dur côté UI).
 * @param key      clé de réplique (voir CoachKey)
 * @param exId     id de l'exercice annoncé (pour go/intro/rest)
 * @param fallback texte lu par la synthèse si le clip n'est pas disponible
 */
export function coachSpeak(key: string, exId: string | undefined, fallback: string) {
  if (!voiceOn) return;
  if (VOICE_MODE === "pauline" && typeof window !== "undefined") {
    const file = PER_EX_KEYS.has(key) && exId ? `${key}_${exId}` : key;
    try {
      cueAudio?.pause();
      cancelVoice();
      cueAudio = new Audio(`${AUDIO_DIR}/${file}.mp3`);
      cueAudio.play().catch(() => say(fallback));
      return;
    } catch { /* repli synthèse */ }
  }
  say(fallback);
}

export function pauseVoice() { try { speechSynthesis?.pause(); } catch { /* */ } }
export function resumeVoice() { try { speechSynthesis?.resume(); } catch { /* */ } }
export function cancelVoice() { try { speechSynthesis?.cancel(); } catch { /* */ } }
