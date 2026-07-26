/* Persistance locale (localStorage). Aucune base de données, aucun compte.
 * Le jour de la fusion Tsuno, on remplacera ces fonctions par des appels
 * Supabase (même signature) sans toucher à l'UI. */

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
  getProfile(): ProfileDraft | null { return read<ProfileDraft | null>("ym_profile", null); },
  setProfile(p: ProfileDraft) { write("ym_profile", p); },

  getHistory(): Session[] { return read<Session[]>("ym_history", []); },
  addSession(s: Session) { const h = this.getHistory(); h.push(s); write("ym_history", h); },

  getSettings(): Settings { return read<Settings>("ym_settings", { voice: true, sound: true }); },
  setSettings(s: Settings) { write("ym_settings", s); },
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
