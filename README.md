# Yumea Move 🏃‍♀️

PWA de **sport à la maison** : séances courtes (5 à 30 min), sans matériel,
générées selon objectif × niveau × durée. Minuteur avec compte à rebours,
coach vocal, suivi de la série (streak). Esprit BetterMe / Grity / calisthénie.

> **Stack alignée sur Tsuno** (Next.js 16 + React 19 + Tailwind v4, TypeScript),
> mais en **export 100 % statique** → se déploie sans serveur ni base de données,
> et s'intègre plus tard dans `hub-tsuno` avec un minimum de friction.

---

## ✨ Fonctionnel

- **Générateur de programmes** : full body / fessiers / ventre / cardio / haut du
  corps / mobilité × débutant→avancé × 5–30 min. Échauffement → circuit (tours) →
  retour au calme, calé sur la durée.
- **Lecteur** : anneau de minuteur, décompte 3-2-1, travail/repos, exercice suivant
  annoncé, pause / précédent / suivant, barre de progression.
- **Coach vocal (anglais)** via Web Speech API (gratuit, hors-ligne) + **bips**
  Web Audio. Langue centralisée dans `src/lib/coach.ts` (`VOICE_LANG`).
- **Suivi** : série 🔥, historique, minutes, vue semaine — en `localStorage`
  (aucun compte, aucune DB). `src/lib/store.ts` isole la persistance : au moment de
  la fusion Tsuno, on remplace ces fonctions par Supabase sans toucher à l'UI.
- **PWA** installable + offline (`public/manifest.webmanifest`, `public/sw.js`).
- **~35 exercices** au poids du corps (flag `impact` = option sans saut).
- **Vidéos d'exercices** : chaque exercice peut porter un champ `media` (URL vidéo).
  Si vide → illustration animée (emoji). Un exemple réel est branché : `squats`
  (vidéo générée sur Higgsfield, `public/exercises/squats.mp4`).

## 🗂️ Structure

```
next.config.ts          output: "export" (statique)
src/app/                layout, page (machine à états), globals.css (tokens + styles)
src/components/          WorkoutPlayer.tsx (moteur timer/voix/sons)
src/lib/                 data.ts (exos + générateur), store.ts (persistance), coach.ts (audio)
public/                 manifest, sw.js, icons/, exercises/ (vidéos)
prototype-vanilla/      1er prototype vanilla (archive, non utilisé)
```

## ▶️ Développer

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # génère out/ (statique)
npx tsc --noEmit       # type-check (comme Tsuno, avant merge)
```

## 🚀 Déploiement (VPS + Caddy, statique)

`npm run build` produit `out/`. Caddy le sert directement (HTTPS auto), sans Node :

```
move.yumea.fr {
    root * /root/projets/yumea-sport/out
    encode gzip
    try_files {path} {path}.html /index.html
    file_server
}
```

Pré-requis : un enregistrement DNS `move.yumea.fr` → IP du VPS.

---

## 🎬 Médias (Higgsfield)

- Vidéos d'exercices : `generate_video` (Kling, 9:16, boucle) → `public/exercises/`.
- Voix humaine premium (anglais) à venir : embarquée dans la vidéo ou en piste audio.
  Le français sera **doublé plus tard via un autre service** de voix.
- Le VPS a un accès Internet ouvert → génération + téléchargement des rendus s'y font
  directement.

## 🛣️ Suite

- [ ] Bibliothèque vidéo complète (1 clip par exercice) + posters.
- [ ] Voix humaine anglaise par exercice.
- [ ] Planning hebdo + rappels (notifications PWA).
- [ ] Fusion dans `hub-tsuno` (retirer `output: export`, brancher Supabase, SSO employés).
