/* Coach audio : voix (SpeechSynthesis navigateur) + bips (Web Audio).
 * 100 % côté navigateur → zéro coût, hors-ligne. Anglais pour l'instant
 * (VOICE_LANG). Le jour où on veut une vraie voix humaine, on remplace `say`
 * par la lecture d'un fichier audio pré-généré, sans changer les appels. */

export const VOICE_LANG = "en-US";

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

export function pauseVoice() { try { speechSynthesis?.pause(); } catch { /* */ } }
export function resumeVoice() { try { speechSynthesis?.resume(); } catch { /* */ } }
export function cancelVoice() { try { speechSynthesis?.cancel(); } catch { /* */ } }
