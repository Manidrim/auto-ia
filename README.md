# Auto-IA 🤖🧮

Projet qui **s'auto-alimente** : l'IA propose, tu valides, l'IA code, la CI vérifie, et une nouvelle issue naît à chaque merge.

## La boucle d'itération

1. Une **issue** est créée (par l'IA après un merge, ou manuellement). Toujours petite, au format user story :
   > En tant que [élève], je veux [action], afin de [bénéfice].
2. Tu valides en ajoutant le label **`validated`**.
3. Le workflow [`auto-pr.yml`](.github/workflows/auto-pr.yml) appelle l'API Mistral, qui implémente l'issue et ouvre une **PR**.
4. La **CI** ([`ci.yml`](.github/workflows/ci.yml)) fait tourner les tests vitest et le build Vite sur la PR.
5. Tu merges la PR → le workflow [`next-issue.yml`](.github/workflows/next-issue.yml) demande à l'IA de créer la **prochaine issue**.

## Le site

Site Vite + React pour des élèves de primaire : exercices de maths (additions, soustractions, multiplications) avec score et feedback immédiat.

```bash
npm install
npm run dev
npm test
npm run build
```

## Configuration requise

- Secret **`MISTRAL_API_KEY`** (Settings → Secrets and variables → Actions).
- Label **`validated`** (créé automatiquement au premier lancement s'il manque).

## Labels

| Label | Rôle |
|---|---|
| `validated` | Déclenche la génération automatique de la PR |
| `enhancement` | Issue de nouvelle fonctionnalité |
