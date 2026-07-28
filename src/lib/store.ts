/* =========================================================================
 * Yumea Move — Couche de persistance UNIQUE.
 *
 * ⚠️ SEULE porte d'accès aux données. L'UI ne touche JAMAIS localStorage ni
 *    le réseau directement : elle passe toujours par `store`, `computeStreak`,
 *    `lastSevenDays`. Le jour de la fusion Tsuno, on remplace UNIQUEMENT
 *    l'intérieur de ce fichier (localStorage → appels Tsuno/Supabase, mêmes
 *    signatures) — aucun composant à modifier.
 *
 * Pas d'authentification : l'app marche sans compte. Les réglages et clés
 * viennent de config.ts (centralisés, façon coach.ts).
 * ========================================================================= */
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/lib/config";

export interface Session { date: string; goal: string; title: string; minutes: number; }
export interface Settings { voice: boolean; sound: boolean; }
export interface ProfileDraft { goal: string; level: string; duration: number; }

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export const store = {
  getProfile(): ProfileDraft | null { return read<ProfileDraft | null>(STORAGE_KEYS.profile, null); },
  setProfile(p: ProfileDraft) { write(STORAGE_KEYS.profile, p); },

  getHistory(): Session[] { return read<Session[]>(STORAGE_KEYS.history, []); },
  addSession(s: Session) { const h = this.getHistory(); h.push(s); write(STORAGE_KEYS.history, h); },
  setHistory(h: Session[]) { write(STORAGE_KEYS.history, h); },

  getSettings(): Settings { return read<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS); },
  setSettings(s: Settings) { write(STORAGE_KEYS.settings, s); },
};

function isoDay(d: Date) { return d.toISOString().slice(0, 10); }

export function computeStreak(history: Session[]): number {
  const days = new Set(history.map((h) => h.date.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  if (!days.has(isoDay(d))) d.setDate(d.getDate() - 1);
  while (days.has(isoDay(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export function lastSevenDays(history: Session[]) {
  const out: { label: string; active: boolean }[] = [];
  const letters = ["D", "L", "M", "M", "J", "V", "S"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = isoDay(d);
    out.push({ label: letters[d.getDay()], active: history.some((x) => x.date.slice(0, 10) === key) });
  }
  return out;
}
