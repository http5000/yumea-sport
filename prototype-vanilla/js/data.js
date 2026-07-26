/* =========================================================================
 * Yumea Move — Base d'exercices + générateur de programmes
 * Tout est "au poids du corps", sans matériel. Chaque exercice porte un flag
 * `impact` (low = sans saut) pour rester doux quand l'utilisateur le demande.
 *
 * `media` (optionnel) = URL d'une vidéo boucle (générée sur Higgsfield).
 * Tant que `media` est vide, le lecteur affiche une illustration animée.
 * ========================================================================= */

export const EXERCISES = {
  // --- Échauffement / mobilité ---
  marche_sur_place:   { name: "Marche sur place",        cat: "warmup", impact: "low",  emoji: "🚶", cue: "Monte les genoux, balance les bras." },
  cercles_bras:       { name: "Cercles de bras",         cat: "warmup", impact: "low",  emoji: "🌀", cue: "Grands cercles lents, épaules relâchées." },
  rotation_hanches:   { name: "Rotations des hanches",   cat: "warmup", impact: "low",  emoji: "🔄", cue: "Mains sur les hanches, dessine de grands cercles." },
  fentes_marchees:    { name: "Fentes marchées",         cat: "warmup", impact: "low",  emoji: "🚶‍♀️", cue: "Grand pas, genou arrière vers le sol." },
  chat_vache:         { name: "Chat / Vache",            cat: "warmup", impact: "low",  emoji: "🐱", cue: "À quatre pattes, arrondis puis creuse le dos." },

  // --- Cardio (impact modulable) ---
  montees_genoux:     { name: "Montées de genoux",       cat: "cardio", impact: "low",  emoji: "🏃", cue: "Genoux à hauteur de hanches, gainage actif." },
  talons_fesses:      { name: "Talons-fesses",           cat: "cardio", impact: "low",  emoji: "🦵", cue: "Ramène les talons vers les fessiers, rythme régulier." },
  jumping_jacks:      { name: "Jumping jacks",           cat: "cardio", impact: "high", emoji: "⭐", cue: "Bras et jambes s'ouvrent en même temps." },
  pas_chasses:        { name: "Pas chassés",             cat: "cardio", impact: "low",  emoji: "↔️", cue: "Reste bas, déplace-toi latéralement." },
  shadow_boxing:      { name: "Shadow boxing",           cat: "cardio", impact: "low",  emoji: "🥊", cue: "Directs et crochets, gaine le ventre." },
  mountain_climbers:  { name: "Mountain climbers",       cat: "cardio", impact: "low",  emoji: "⛰️", cue: "En planche, ramène les genoux vers la poitrine." },

  // --- Bas du corps ---
  squats:             { name: "Squats",                  cat: "lower",  impact: "low",  emoji: "🪑", cue: "Assieds-toi en arrière, poids sur les talons." },
  squat_sumo:         { name: "Squat sumo",              cat: "lower",  impact: "low",  emoji: "🤸", cue: "Pieds larges, pointes vers l'extérieur." },
  fentes_statiques:   { name: "Fentes statiques",        cat: "lower",  impact: "low",  emoji: "🦿", cue: "Descends droit, genou arrière vers le sol." },
  pont_fessier:       { name: "Pont fessier",            cat: "lower",  impact: "low",  emoji: "🌉", cue: "Pousse dans les talons, serre les fessiers en haut." },
  donkey_kicks:       { name: "Donkey kicks",            cat: "lower",  impact: "low",  emoji: "🦵", cue: "À quatre pattes, pousse le talon vers le plafond." },
  fire_hydrant:       { name: "Fire hydrants",           cat: "lower",  impact: "low",  emoji: "🐕", cue: "À quatre pattes, ouvre la hanche sur le côté." },
  chaise_mur:         { name: "Chaise contre le mur",    cat: "lower",  impact: "low",  emoji: "🧱", cue: "Dos au mur, cuisses parallèles au sol, tiens." },
  releve_mollets:     { name: "Relevés de mollets",      cat: "lower",  impact: "low",  emoji: "🦶", cue: "Monte sur la pointe des pieds, contrôle la descente." },

  // --- Haut du corps ---
  pompes:             { name: "Pompes",                  cat: "upper",  impact: "low",  emoji: "💪", cue: "Corps gainé, coudes à 45°." },
  pompes_genoux:      { name: "Pompes sur les genoux",   cat: "upper",  impact: "low",  emoji: "🙇", cue: "Appui sur les genoux, buste bien droit." },
  dips_chaise:        { name: "Dips sur chaise",         cat: "upper",  impact: "low",  emoji: "🪑", cue: "Mains sur le siège, descends les coudes vers l'arrière." },
  pike_pushups:       { name: "Pompes piquées",          cat: "upper",  impact: "low",  emoji: "🔺", cue: "Bassin haut, tête vers le sol, sollicite les épaules." },
  superman:           { name: "Superman",               cat: "upper",  impact: "low",  emoji: "🦸", cue: "Sur le ventre, décolle bras et jambes." },

  // --- Gainage / core ---
  planche:            { name: "Planche",                 cat: "core",   impact: "low",  emoji: "🧘", cue: "Corps aligné, nombril rentré, respire." },
  planche_laterale:   { name: "Planche latérale",        cat: "core",   impact: "low",  emoji: "📐", cue: "Sur l'avant-bras, hanches hautes. Change de côté." },
  crunchs:            { name: "Crunchs",                 cat: "core",   impact: "low",  emoji: "🎯", cue: "Décolle les omoplates, souffle en montant." },
  bicycle_crunch:     { name: "Bicycle crunch",          cat: "core",   impact: "low",  emoji: "🚲", cue: "Coude vers le genou opposé, pédale lentement." },
  dead_bug:           { name: "Dead bug",                cat: "core",   impact: "low",  emoji: "🐞", cue: "Sur le dos, bras et jambe opposés s'éloignent." },
  releve_jambes:      { name: "Relevés de jambes",       cat: "core",   impact: "low",  emoji: "🦵", cue: "Jambes tendues, descends sans creuser le dos." },
  gainage_toe_touch:  { name: "Toe touches",             cat: "core",   impact: "low",  emoji: "👆", cue: "Jambes en l'air, viens toucher les pointes." },

  // --- Étirements / retour au calme ---
  etirement_ischios:  { name: "Étirement ischios",       cat: "cooldown", impact: "low", emoji: "🧎", cue: "Jambe tendue, penche-toi doucement vers l'avant." },
  etirement_quadri:   { name: "Étirement quadriceps",    cat: "cooldown", impact: "low", emoji: "🦩", cue: "Attrape la cheville, genoux serrés." },
  etirement_dos:      { name: "Posture de l'enfant",     cat: "cooldown", impact: "low", emoji: "🧘‍♀️", cue: "Fessiers vers les talons, bras tendus devant." },
  respiration:        { name: "Respiration profonde",    cat: "cooldown", impact: "low", emoji: "🌬️", cue: "Inspire 4 s, expire 6 s. Relâche tout." },
  etirement_cou:      { name: "Étirement de la nuque",   cat: "cooldown", impact: "low", emoji: "🙆", cue: "Incline la tête sur le côté, épaules basses." },
};

/* ---- Objectifs proposés à l'utilisateur ---- */
export const GOALS = {
  full_body:  { label: "Full body",        icon: "🔥", desc: "Un peu de tout, corps entier",       focus: ["lower", "upper", "core", "cardio"] },
  fessiers:   { label: "Fessiers & jambes", icon: "🍑", desc: "Renforcer le bas du corps",         focus: ["lower", "lower", "core"] },
  ventre:     { label: "Ventre plat",      icon: "🎯", desc: "Gainage et abdominaux",              focus: ["core", "core", "cardio"] },
  cardio:     { label: "Cardio brûle-graisses", icon: "⚡", desc: "Faire monter le rythme",        focus: ["cardio", "lower", "cardio", "core"] },
  haut:       { label: "Haut du corps",    icon: "💪", desc: "Bras, épaules, dos, poitrine",       focus: ["upper", "upper", "core"] },
  mobilite:   { label: "Mobilité douce",   icon: "🧘", desc: "Se dénouer, sans transpirer",        focus: ["warmup", "core", "cooldown"] },
};

export const LEVELS = {
  debutant:     { label: "Débutant",     work: 30, rest: 20, rounds: 2, lowImpactOnly: true  },
  intermediaire:{ label: "Intermédiaire", work: 40, rest: 15, rounds: 3, lowImpactOnly: false },
  avance:       { label: "Avancé",       work: 45, rest: 10, rounds: 3, lowImpactOnly: false },
};

export const DURATIONS = [5, 10, 15, 20, 30];

/* =========================================================================
 * Générateur de programme.
 * Construit : échauffement -> circuit principal (n rounds) -> retour au calme
 * en respectant la durée cible, le niveau et l'objectif.
 * ========================================================================= */

function pool(cat, lowOnly) {
  return Object.entries(EXERCISES)
    .filter(([, e]) => e.cat === cat && (!lowOnly || e.impact === "low"))
    .map(([id]) => id);
}

// petit générateur pseudo-aléatoire déterministe (seed) pour la reproductibilité
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick(arr, rng, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

/**
 * @param {object} profile { goal, level, duration, seed }
 * @returns {object} programme { title, meta, blocks: [{phase, exId, work, rest}] }
 */
export function generateProgram({ goal, level, duration, seed = 1 }) {
  const g = GOALS[goal] || GOALS.full_body;
  const lv = LEVELS[level] || LEVELS.debutant;
  const rng = makeRng(seed * 2654435761);
  const lowOnly = lv.lowImpactOnly;

  const totalSec = duration * 60;
  const warmupSec = Math.min(90, Math.round(totalSec * 0.15));
  const cooldownSec = Math.min(90, Math.round(totalSec * 0.15));
  const mainSec = totalSec - warmupSec - cooldownSec;

  const blocks = [];

  // --- Échauffement ---
  const warmPool = pick(pool("warmup", lowOnly), rng, 3);
  let acc = 0, wi = 0;
  while (acc < warmupSec && warmPool.length) {
    const exId = warmPool[wi % warmPool.length];
    const work = 30;
    blocks.push({ phase: "warmup", exId, work, rest: 5 });
    acc += work + 5; wi++;
  }

  // --- Circuit principal : construit une liste d'exercices selon le focus ---
  const perRound = [];
  g.focus.forEach((cat) => {
    const chosen = pick(pool(cat, lowOnly), rng, 1)[0] || pick(pool("core", lowOnly), rng, 1)[0];
    if (chosen) perRound.push(chosen);
  });
  // complète si besoin pour avoir au moins 4 exercices variés
  while (perRound.length < 4) {
    const cat = ["lower", "upper", "core", "cardio"][perRound.length % 4];
    const c = pick(pool(cat, lowOnly), rng, 1)[0];
    if (c && !perRound.includes(c)) perRound.push(c); else break;
  }

  const roundSec = perRound.reduce((s, id) => s + lv.work + lv.rest, 0);
  const rounds = Math.max(1, Math.min(6, Math.round(mainSec / roundSec)));

  for (let r = 0; r < rounds; r++) {
    perRound.forEach((exId, idx) => {
      const isLast = r === rounds - 1 && idx === perRound.length - 1;
      blocks.push({ phase: "main", exId, work: lv.work, rest: isLast ? 0 : lv.rest, round: r + 1, rounds });
    });
  }

  // --- Retour au calme ---
  const coolPool = pick(pool("cooldown", true), rng, 3);
  acc = 0; let ci = 0;
  while (acc < cooldownSec && coolPool.length) {
    const exId = coolPool[ci % coolPool.length];
    const work = 30;
    blocks.push({ phase: "cooldown", exId, work, rest: 3 });
    acc += work + 3; ci++;
  }

  const realSec = blocks.reduce((s, b) => s + b.work + b.rest, 0);

  return {
    title: `${g.label} · ${lv.label}`,
    goal, level, duration,
    meta: {
      goalLabel: g.label, goalIcon: g.icon,
      levelLabel: lv.label,
      rounds,
      exercises: perRound.length,
      estMin: Math.round(realSec / 60),
    },
    blocks,
  };
}
