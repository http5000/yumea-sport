/* =========================================================================
 * Yumea Move — Répliques du coach (pistes vocales)
 *
 * OBJECTIF TRADUCTION / DOUBLAGE :
 *   - Chaque réplique porte une CLÉ STABLE (CoachKey). Le texte est dissocié
 *     de la vidéo : une clé = une piste vocale potentielle.
 *   - Pour traduire : dupliquer ce fichier (ex. phrases.fr.ts) avec les MÊMES
 *     clés, et changer `lang` + les textes. L'app choisit le jeu selon la langue.
 *   - Pour un doublage audio pré-généré (voix humaine) : mapper chaque clé vers
 *     un fichier son (public/audio/<lang>/<key>.mp3) et lire ce fichier au lieu
 *     de la synthèse navigateur. Le lecteur n'appelle QUE ces clés, jamais des
 *     chaînes en dur → rien à ré-écrire côté UI le jour de la traduction.
 *
 * Langue actuelle : anglais (voix navigateur, gratuite). FR doublé plus tard.
 * ========================================================================= */

export type CoachKey =
  | "intro"       // avant la 1re série (annonce le 1er exercice)
  | "go"          // début d'un exercice
  | "halfway"     // mi-parcours de l'exercice
  | "tenLeft"     // 10 secondes restantes
  | "rest"        // début du repos (annonce le prochain)
  | "restLast"    // repos sans prochain exercice
  | "finish";     // séance terminée

export interface CoachPack {
  lang: string; // BCP-47, ex. "en-US" / "fr-FR"
  lines: Record<CoachKey, (arg?: string) => string>;
}

/** Jeu de répliques ANGLAIS (par défaut). `arg` = nom de l'exercice prononcé. */
export const COACH_EN: CoachPack = {
  lang: "en-US",
  lines: {
    intro:    (ex = "") => `Get ready. First exercise: ${ex}.`,
    go:       (ex = "") => `${ex}. Let's go!`,
    halfway:  () => "Halfway there! Keep it up.",
    tenLeft:  () => "Ten seconds left!",
    rest:     (nextEx = "") => `Rest. Next up: ${nextEx}.`,
    restLast: () => "Rest.",
    finish:   () => "Well done! Workout complete.",
  },
};

/** Jeu de répliques FRANÇAIS — voix Pauline (Cartesia), doublage pré-généré.
 *  `arg` = nom de l'exercice prononcé. Tutoiement, énergique mais élégant. */
export const COACH_FR: CoachPack = {
  lang: "fr-FR",
  lines: {
    intro:    (ex = "") => `Prêts ? On commence par ${ex}.`,
    go:       (ex = "") => `${ex}. C'est parti !`,
    halfway:  () => "Milieu de série, tiens bon !",
    tenLeft:  () => "Encore dix secondes, tiens bon !",
    rest:     (nextEx = "") => `Repos. Ensuite, ${nextEx}.`,
    restLast: () => "Repos.",
    finish:   () => "Bravo, séance terminée. Rendez-vous demain !",
  },
};

/** Pack actif : FR (voix Pauline, doublage en ligne). */
export const COACH: CoachPack = COACH_FR;
