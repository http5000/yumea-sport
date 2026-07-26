# Yumea Move 🏃‍♀️

Une **PWA de sport à la maison** : des séances courtes (5 à 30 min), sans matériel,
générées selon ton objectif et ton niveau. Coach vocal en français, minuteur avec
compte à rebours, suivi de ta série (streak). Inspiré de BetterMe / Grity / apps de
calisthénie, dans l'esprit de la maquette « Elevate Your Body ».

> **MVP fonctionnel** — installable, utilisable hors-ligne, zéro dépendance, zéro build.

---

## ✨ Ce qui marche déjà

- **Générateur de programmes** : objectif (full body, fessiers, ventre, cardio, haut du
  corps, mobilité) × niveau (débutant → avancé) × durée (5–30 min). Le moteur construit
  échauffement → circuit (plusieurs tours) → retour au calme, en respectant la durée.
- **Lecteur d'entraînement** : anneau de minuteur, compte à rebours « 3-2-1 »,
  temps de travail/repos, exercice suivant annoncé, pause / précédent / suivant.
- **Coach vocal français** : via l'API Web Speech du navigateur (gratuit, hors-ligne).
  Option pour brancher une voix premium générée sur Higgsfield (voir plus bas).
- **Bips de décompte** : Web Audio API (3 bips avant la fin de chaque intervalle).
- **Suivi & motivation** : série de jours (streak), historique, minutes actives,
  vue « cette semaine ». Tout est stocké en local (localStorage).
- **PWA** : `manifest` + service worker → installable sur l'écran d'accueil,
  fonctionne hors connexion.
- **~35 exercices** au poids du corps, chacun avec un flag `impact` (option sans saut).

## 🗂️ Structure

```
index.html              coquille de l'app
manifest.webmanifest    métadonnées PWA
sw.js                   service worker (offline-first)
css/style.css           thème corail/crème, mobile-first
js/data.js              base d'exercices + générateur de programmes
js/player.js            lecteur (timer, voix, sons)
js/app.js               routage, écrans, stockage local
icons/                  icônes PWA
assets/                 médias générés (vidéos d'exercices, voix)
```

## ▶️ Lancer en local

Aucun build. Il faut juste un serveur statique (pour les modules ES + le service worker) :

```bash
python3 -m http.server 8099
# puis ouvrir http://localhost:8099
```

Sur mobile : ouvrir l'URL, puis « Ajouter à l'écran d'accueil ».

---

## 🎬 Illustrations vidéo & voix (Higgsfield)

Chaque exercice peut afficher une **vidéo boucle**. Tant que le champ `media` d'un
exercice est vide (`js/data.js`), le lecteur affiche une illustration animée (emoji).
Dès qu'on renseigne une URL vidéo, elle s'affiche automatiquement à la place.

Pipeline de production des médias (via le serveur MCP Higgsfield) :

1. **Vidéo d'exercice** — `generate_video` (Kling 3.0 Turbo, 9:16, 5 s) → boucle verticale.
2. **Voix premium FR** — `generate_audio` (Seed Audio, voix française) → clips de coaching.
3. Télécharger les rendus dans `assets/exercises/` et `assets/audio/`, puis renseigner
   `media:` sur l'exercice concerné.

Un échantillon de chaque a été généré pour valider le pipeline (voir `assets/`).

---

## 🛣️ Feuille de route

- [ ] Générer la bibliothèque vidéo complète (1 clip par exercice) + posters.
- [ ] Voix premium FR pré-générée par exercice (fallback = Web Speech).
- [ ] Personnalisation avancée (zones à éviter, matériel dispo, blessures).
- [ ] Planning hebdo + rappels (notifications PWA).
- [ ] Comptes / synchro cloud (aujourd'hui : 100 % local).
- [ ] Intégration optionnelle dans l'outil interne (SSO employés).
