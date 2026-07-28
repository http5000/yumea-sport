/* Auth + synchronisation cloud (API Move). Le token JWT vit dans localStorage.
 * La sauvegarde locale (store.ts) reste la source hors-ligne ; quand on est
 * connecté, les séances sont poussées vers le serveur et l'historique serveur
 * (fusionné par email au niveau du compte) fait foi. */
"use client";
import type { Session } from "./store";

const API = "/api/v1";
const TOKEN_KEY = "ym_token";
const USER_KEY = "ym_user";

export interface AuthUser { id: string; email: string; profile?: unknown }
export interface Stats { sessions: number; minutes: number; streak: number; points: number; activeDays: number }

const isBrowser = () => typeof window !== "undefined";

export function getToken(): string | null { return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null; }
export function isLoggedIn(): boolean { return !!getToken(); }
export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  try { const v = localStorage.getItem(USER_KEY); return v ? (JSON.parse(v) as AuthUser) : null; }
  catch { return null; }
}
function setSession(token: string, user: AuthUser) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function req(path: string, opts: RequestInit = {}, authed = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as Record<string, string> || {}) };
  if (authed) { const t = getToken(); if (t) headers.Authorization = `Bearer ${t}`; }
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `http_${res.status}`);
  return data;
}

/** Messages d'erreur lisibles (FR) à partir des codes serveur. */
export function authError(code: string): string {
  const map: Record<string, string> = {
    invalid_email: "Email invalide.",
    weak_password: "Mot de passe trop court (6 caractères minimum).",
    email_taken: "Un compte existe déjà avec cet email.",
    bad_credentials: "Email ou mot de passe incorrect.",
  };
  return map[code] || "Une erreur est survenue. Réessaie.";
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const d = await req("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });
  setSession(d.token, d.user); return d.user as AuthUser;
}
export async function login(email: string, password: string): Promise<AuthUser> {
  const d = await req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  setSession(d.token, d.user); return d.user as AuthUser;
}
export function me(): Promise<{ user: AuthUser; stats: Stats; history: Session[] }> {
  return req("/me", {}, true);
}
export function pushSession(s: Session): Promise<{ stats: Stats }> {
  return req("/sessions", { method: "POST", body: JSON.stringify(s) }, true);
}
export function syncSessions(sessions: Session[]): Promise<{ stats: Stats; history: Session[] }> {
  return req("/sessions/sync", { method: "POST", body: JSON.stringify({ sessions }) }, true);
}
export function putProfile(profile: unknown): Promise<{ ok: boolean }> {
  return req("/profile", { method: "PUT", body: JSON.stringify(profile) }, true);
}
