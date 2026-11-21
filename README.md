# Auto-IA 🤖🧮

Projet qui **s'auto-alimente** : l'IA propose, tu valides, l'IA code, la CI vérifie, et une nouvelle issue naît à chaque merge.

## La boucle d'itération

1. Une **issue** est créée (par l'IA après un merge, ou manuellement). Toujours petite, au format user story :
   > En tant que [élève], je veux [action], afin de [bénéfice].
2. Tu valides en ajoutant le label **`validated`**.
3. Le workflow [`auto-pr.yml`](.github/workflows/auto-pr.yml) appelle l'API Mistral, qui implémente l'issue (corps + commentaires) et ouvre une **PR**.
4. Tu testes la PR (preview Vercel) :
   - **`/question`** + ta question → le workflow [`answer-pr.yml`](.github/workflows/answer-pr.yml) répond par commentaire, sans toucher au code
   - **`/corrige`** + tes retours → le workflow [`fix-pr.yml`](.github/workflows/fix-pr.yml) applique les corrections sur la même PR
5. La **CI** ([`ci.yml`](.github/workflows/ci.yml)) fait tourner les tests vitest et le build Vite sur la PR.
6. Tu merges la PR → le workflow [`next-issue.yml`](.github/workflows/next-issue.yml) demande à l'IA de créer la **prochaine issue**.

## Le site

Site Vite + React pour des élèves de primaire (CP à CM2) : exercices dans les matières du programme scolaire — français, maths, histoire, géographie, sciences, anglais, EMC — avec score et feedback immédiat.

**Orientation produit** : les issues générées automatiquement doivent apporter du contenu pédagogique de niveau (matières et notions du programme, par classe), pas seulement des fonctionnalités d'interface.

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Architecture (hexagonale light)

- `src/domain/` — cœur métier **pur** (aucun import React/DOM/localStorage) : `niveau.js`, `matiere.js` (registre des matières), `exercice.js`, `random.js`, `content/` (données pédagogiques). Le générateur de hasard est injecté (`rand`), ce qui rend les tests déterministes.
- `src/application/` — cas d'usage : `quizSession.js` (session, scoring), `ports.js` (contrat `ProgressRepository`).
- `src/infrastructure/` — adaptateurs : `rng.js` (rand seedable), `localStorageProgress.js` (implémente le port).
- `src/ui/` — adaptateur pilotant (React) : `App.jsx`, `components/Quiz.jsx`.

## Configuration requise

- Secret **`MISTRAL_API_KEY`** (Settings → Secrets and variables → Actions).
- Label **`validated`** (créé automatiquement au premier lancement s'il manque).

## Labels

| Label         | Rôle                                         |
| ------------- | -------------------------------------------- |
| `validated`   | Déclenche la génération automatique de la PR |
| `enhancement` | Issue de nouvelle fonctionnalité             |
