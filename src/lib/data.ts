/* =========================================================================
 * Yumea Move — Base d'exercices + générateur de programmes (TypeScript)
 * Tout est au poids du corps, sans matériel. `impact: "low"` = sans saut.
 * `media` (optionnel) = URL d'une vidéo boucle (générée sur Higgsfield).
 * Tant que `media` est vide, le lecteur affiche une illustration animée.
 * ========================================================================= */

export type Category =
  | "warmup" | "cardio" | "lower" | "upper" | "core" | "cooldown";

export interface Exercise {
  /** Nom affiché (FR). En anglais phonétique pour le coach vocal via `voice`. */
  name: string;
  /** Terme prononcé par le coach (anglais). Défaut = name. */
  voice?: string;
  cat: Category;
  impact: "low" | "high";
  emoji: string;
  cue: string;
  media?: string;
}

export const EXERCISES: Record<string, Exercise> = {
  // --- Échauffement / mobilité ---
  marche_sur_place:   { name: "Marche sur place",      voice: "March in place",   cat: "warmup", impact: "low", emoji: "🚶", cue: "Monte les genoux, balance les bras." },
  cercles_bras:       { name: "Cercles de bras",       voice: "Arm circles",      cat: "warmup", impact: "low", emoji: "🌀", cue: "Grands cercles lents, épaules relâchées." },
  rotation_hanches:   { name: "Rotations des hanches", voice: "Hip circles",      cat: "warmup", impact: "low", emoji: "🔄", cue: "Mains sur les hanches, dessine de grands cercles." },
  fentes_marchees:    { name: "Fentes marchées",       voice: "Walking lunges",   cat: "warmup", impact: "low", emoji: "🚶‍♀️", cue: "Grand pas, genou avant aligné avec la cheville, buste droit." },
  chat_vache:         { name: "Chat / Vache",          voice: "Cat cow",          cat: "warmup", impact: "low", emoji: "🐱", cue: "À quatre pattes, arrondis puis creuse le dos." },

  // --- Cardio ---
  montees_genoux:     { name: "Montées de genoux",     voice: "High knees",       cat: "cardio", impact: "low",  emoji: "🏃", cue: "Genoux à hauteur de hanches, gainage actif." },
  talons_fesses:      { name: "Talons-fesses",         voice: "Butt kicks",       cat: "cardio", impact: "low",  emoji: "🦵", cue: "Ramène les talons vers les fessiers, rythme régulier." },
  jumping_jacks:      { name: "Jumping jacks",         voice: "Jumping jacks",    cat: "cardio", impact: "high", emoji: "⭐", cue: "Bras et jambes s'ouvrent en même temps." },
  pas_chasses:        { name: "Pas chassés",           voice: "Side steps",       cat: "cardio", impact: "low",  emoji: "↔️", cue: "Reste bas, déplace-toi latéralement." },
  shadow_boxing:      { name: "Shadow boxing",         voice: "Shadow boxing",    cat: "cardio", impact: "low",  emoji: "🥊", cue: "Directs et crochets, gaine le ventre." },
  mountain_climbers:  { name: "Mountain climbers",     voice: "Mountain climbers",cat: "cardio", impact: "low",  emoji: "⛰️", cue: "En planche gainée, hanches basses, ramène les genoux sans monter les fessiers." },

  // --- Bas du corps ---
  squats:             { name: "Squats",                voice: "Squats",           cat: "lower", impact: "low", emoji: "🪑", cue: "Poids sur les talons, genoux alignés avec la pointe des pieds, dos droit.", media: "/exercises/squats.mp4" },
  squat_sumo:         { name: "Squat sumo",            voice: "Sumo squats",      cat: "lower", impact: "low", emoji: "🤸", cue: "Pieds larges, pointes vers l'extérieur, genoux dans l'axe des orteils, buste droit." },
  fentes_statiques:   { name: "Fentes statiques",      voice: "Static lunges",    cat: "lower", impact: "low", emoji: "🦿", cue: "Descends droit, genou avant au-dessus de la cheville, dos droit." },
  pont_fessier:       { name: "Pont fessier",          voice: "Glute bridge",     cat: "lower", impact: "low", emoji: "🌉", cue: "Pousse dans les talons, serre les fessiers en haut, sans cambrer le bas du dos." },
  donkey_kicks:       { name: "Donkey kicks",          voice: "Donkey kicks",     cat: "lower", impact: "low", emoji: "🦵", cue: "À quatre pattes, pousse le talon vers le plafond." },
  fire_hydrant:       { name: "Fire hydrants",         voice: "Fire hydrants",    cat: "lower", impact: "low", emoji: "🐕", cue: "À quatre pattes, ouvre la hanche sur le côté." },
  chaise_mur:         { name: "Chaise contre le mur",  voice: "Wall sit",         cat: "lower", impact: "low", emoji: "🧱", cue: "Dos au mur, cuisses parallèles au sol, tiens." },
  releve_mollets:     { name: "Relevés de mollets",    voice: "Calf raises",      cat: "lower", impact: "low", emoji: "🦶", cue: "Monte sur la pointe des pieds, contrôle la descente." },

  // --- Haut du corps ---
  pompes:             { name: "Pompes",                voice: "Push-ups",         cat: "upper", impact: "low", emoji: "💪", cue: "Corps gainé et aligné, coudes à 45°, regard vers le sol." },
  pompes_genoux:      { name: "Pompes sur les genoux", voice: "Knee push-ups",    cat: "upper", impact: "low", emoji: "🙇", cue: "Appui sur les genoux, corps aligné épaules-hanches, coudes à 45°." },
  dips_chaise:        { name: "Dips sur chaise",       voice: "Chair dips",       cat: "upper", impact: "low", emoji: "🪑", cue: "Mains sur le siège, descends les coudes vers l'arrière." },
  pike_pushups:       { name: "Pompes piquées",        voice: "Pike push-ups",    cat: "upper", impact: "low", emoji: "🔺", cue: "Bassin haut, tête vers le sol, sollicite les épaules." },
  superman:           { name: "Superman",             voice: "Superman",         cat: "upper", impact: "low", emoji: "🦸", cue: "Sur le ventre, décolle bras et jambes." },

  // --- Gainage / core ---
  planche:            { name: "Planche",               voice: "Plank",            cat: "core", impact: "low", emoji: "🧘", cue: "Corps aligné des talons à la tête, nombril rentré, ne creuse pas le dos." },
  planche_laterale:   { name: "Planche latérale",      voice: "Side plank",       cat: "core", impact: "low", emoji: "📐", cue: "Sur l'avant-bras, hanches hautes. Change de côté." },
  crunchs:            { name: "Crunchs",               voice: "Crunches",         cat: "core", impact: "low", emoji: "🎯", cue: "Décolle les omoplates, souffle en montant." },
  bicycle_crunch:     { name: "Bicycle crunch",        voice: "Bicycle crunches", cat: "core", impact: "low", emoji: "🚲", cue: "Coude vers le genou opposé, pédale lentement." },
  dead_bug:           { name: "Dead bug",              voice: "Dead bug",         cat: "core", impact: "low", emoji: "🐞", cue: "Sur le dos, bras et jambe opposés s'éloignent." },
  releve_jambes:      { name: "Relevés de jambes",     voice: "Leg raises",       cat: "core", impact: "low", emoji: "🦵", cue: "Jambes tendues, bas du dos plaqué au sol, descends lentement." },
  toe_touches:        { name: "Toe touches",           voice: "Toe touches",      cat: "core", impact: "low", emoji: "👆", cue: "Jambes en l'air, viens toucher les pointes." },

  // --- Retour au calme ---
  etirement_ischios:  { name: "Étirement ischios",     voice: "Hamstring stretch",cat: "cooldown", impact: "low", emoji: "🧎", cue: "Jambe tendue, penche-toi doucement vers l'avant." },
  etirement_quadri:   { name: "Étirement quadriceps",  voice: "Quad stretch",     cat: "cooldown", impact: "low", emoji: "🦩", cue: "Attrape la cheville, genoux serrés." },
  etirement_dos:      { name: "Posture de l'enfant",   voice: "Child's pose",     cat: "cooldown", impact: "low", emoji: "🧘‍♀️", cue: "Fessiers vers les talons, bras tendus devant." },
  respiration:        { name: "Respiration profonde",  voice: "Deep breathing",   cat: "cooldown", impact: "low", emoji: "🌬️", cue: "Inspire 4 s, expire 6 s. Relâche tout." },
  etirement_cou:      { name: "Étirement de la nuque", voice: "Neck stretch",     cat: "cooldown", impact: "low", emoji: "🙆", cue: "Incline la tête sur le côté, épaules basses." },
};

export interface Goal { label: string; icon: string; desc: string; focus: Category[]; }
export const GOALS: Record<string, Goal> = {
  full_body: { label: "Full body",             icon: "🔥", desc: "Un peu de tout, corps entier", focus: ["lower", "upper", "core", "cardio"] },
  fessiers:  { label: "Fessiers & jambes",     icon: "🍑", desc: "Renforcer le bas du corps",   focus: ["lower", "lower", "core"] },
  ventre:    { label: "Ventre plat",           icon: "🎯", desc: "Gainage et abdominaux",        focus: ["core", "core", "cardio"] },
  cardio:    { label: "Cardio brûle-graisses", icon: "⚡", desc: "Faire monter le rythme",       focus: ["cardio", "lower", "cardio", "core"] },
  haut:      { label: "Haut du corps",         icon: "💪", desc: "Bras, épaules, dos, poitrine", focus: ["upper", "upper", "core"] },
  mobilite:  { label: "Mobilité douce",        icon: "🧘", desc: "Se dénouer, sans transpirer",  focus: ["warmup", "core", "cooldown"] },
};

export interface Level { label: string; work: number; rest: number; rounds: number; lowImpactOnly: boolean; }
export const LEVELS: Record<string, Level> = {
  debutant:      { label: "Débutant",      work: 30, rest: 20, rounds: 2, lowImpactOnly: true },
  intermediaire: { label: "Intermédiaire", work: 40, rest: 15, rounds: 3, lowImpactOnly: false },
  avance:        { label: "Avancé",        work: 45, rest: 10, rounds: 3, lowImpactOnly: false },
};

export const DURATIONS = [5, 10, 15, 20, 30] as const;

export interface Block {
  phase: "warmup" | "main" | "cooldown";
  exId: string;
  work: number;
  rest: number;
  round?: number;
  rounds?: number;
}
export interface Program {
  title: string;
  goal: string;
  level: string;
  duration: number;
  meta: { goalLabel: string; goalIcon: string; levelLabel: string; rounds: number; exercises: number; estMin: number; };
  blocks: Block[];
}
export interface ProfileDraft { goal: string; level: string; duration: number; seed?: number; }

function pool(cat: Category, lowOnly: boolean): string[] {
  return Object.entries(EXERCISES)
    .filter(([, e]) => e.cat === cat && (!lowOnly || e.impact === "low"))
    .map(([id]) => id);
}
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function pick(arr: string[], rng: () => number, n: number): string[] {
  const copy = [...arr]; const out: string[] = [];
  while (copy.length && out.length < n) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}

export function generateProgram({ goal, level, duration, seed = 1 }: ProfileDraft): Program {
  const g = GOALS[goal] || GOALS.full_body;
  const lv = LEVELS[level] || LEVELS.debutant;
  const rng = makeRng(seed * 2654435761);
  const lowOnly = lv.lowImpactOnly;

  const totalSec = duration * 60;
  const warmupSec = Math.min(90, Math.round(totalSec * 0.15));
  const cooldownSec = Math.min(90, Math.round(totalSec * 0.15));
  const mainSec = totalSec - warmupSec - cooldownSec;

  const blocks: Block[] = [];

  // Échauffement
  const warmPool = pick(pool("warmup", lowOnly), rng, 3);
  let acc = 0, wi = 0;
  while (acc < warmupSec && warmPool.length) {
    const exId = warmPool[wi % warmPool.length];
    blocks.push({ phase: "warmup", exId, work: 30, rest: 5 });
    acc += 35; wi++;
  }

  // Circuit principal
  const perRound: string[] = [];
  g.focus.forEach((cat) => {
    const chosen = pick(pool(cat, lowOnly), rng, 1)[0] || pick(pool("core", lowOnly), rng, 1)[0];
    if (chosen) perRound.push(chosen);
  });
  while (perRound.length < 4) {
    const cat = (["lower", "upper", "core", "cardio"] as Category[])[perRound.length % 4];
    const c = pick(pool(cat, lowOnly), rng, 1)[0];
    if (c && !perRound.includes(c)) perRound.push(c); else break;
  }

  const roundSec = perRound.reduce((s2) => s2 + lv.work + lv.rest, 0);
  const rounds = Math.max(1, Math.min(6, Math.round(mainSec / roundSec)));

  for (let r = 0; r < rounds; r++) {
    perRound.forEach((exId, idx) => {
      const isLast = r === rounds - 1 && idx === perRound.length - 1;
      blocks.push({ phase: "main", exId, work: lv.work, rest: isLast ? 0 : lv.rest, round: r + 1, rounds });
    });
  }

  // Retour au calme
  const coolPool = pick(pool("cooldown", true), rng, 3);
  acc = 0; let ci = 0;
  while (acc < cooldownSec && coolPool.length) {
    const exId = coolPool[ci % coolPool.length];
    blocks.push({ phase: "cooldown", exId, work: 30, rest: 3 });
    acc += 33; ci++;
  }

  const realSec = blocks.reduce((s2, b) => s2 + b.work + b.rest, 0);

  return {
    title: `${g.label} · ${lv.label}`,
    goal, level, duration,
    meta: { goalLabel: g.label, goalIcon: g.icon, levelLabel: lv.label, rounds, exercises: perRound.length, estMin: Math.round(realSec / 60) },
    blocks,
  };
}
