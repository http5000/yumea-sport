/* =========================================================================
 * Yumea Move — Réglages centralisés (source unique de configuration).
 *
 * Même esprit que coach.ts (tout l'audio au même endroit) : ici on regroupe
 * TOUS les réglages de l'app — marque, clés de stockage, valeurs par défaut,
 * séances express, barème de points. On touche à un seul fichier pour régler
 * le comportement, jamais aux composants.
 *
 * Pas d'authentification : l'app fonctionne sans compte. La persistance passe
 * exclusivement par store.ts (couche unique, remplaçable à la fusion Tsuno).
 * ========================================================================= */
import type { ProfileDraft } from "@/lib/data";
import type { Settings } from "@/lib/store";

/** Identité de marque. */
export const APP = {
  name: "Yumea Move",
  brandLead: "Yumea",
  brandTail: "Move",
  tagline: "Bouge un peu, souvent.",
} as const;

/** Clés localStorage — centralisées pour la couche store.ts. */
export const STORAGE_KEYS = {
  profile: "ym_profile",
  history: "ym_history",
  settings: "ym_settings",
} as const;

/** Valeurs par défaut. */
export const DEFAULT_SETTINGS: Settings = { voice: true, sound: true };
export const DEFAULT_PROFILE: ProfileDraft = { goal: "full_body", level: "debutant", duration: 10 };

/** Barème de points (miroir du calcul serveur/Tsuno le jour venu). */
export const POINTS = { perSession: 10, perMinute: 1 } as const;
export const computePoints = (sessions: number, minutes: number) =>
  sessions * POINTS.perSession + minutes * POINTS.perMinute;

/** Séances express de l'accueil. */
export interface QuickSession { goal: string; level: string; duration: number; tag: string; icon: string }
export const QUICK_SESSIONS: QuickSession[] = [
  { goal: "cardio",   level: "debutant",      duration: 5,  tag: "Réveil express",    icon: "⚡" },
  { goal: "fessiers", level: "intermediaire", duration: 10, tag: "Spécial fessiers",  icon: "🍑" },
  { goal: "ventre",   level: "debutant",      duration: 10, tag: "Gainage du ventre", icon: "🎯" },
  { goal: "mobilite", level: "debutant",      duration: 5,  tag: "Pause détente",     icon: "🧘" },
];
