# Déploiement

- **Dépôt GitHub :** [come-de/to-do-alpha](https://github.com/come-de/to-do-alpha)
- **Branche de production :** `main`
- **Site Netlify :** [orga-victoire.netlify.app](https://orga-victoire.netlify.app)
- **Configuration de build :** `netlify.toml` (`pnpm run build:netlify`, publication depuis `.next`)

Le site Netlify est relié au dépôt GitHub : un push sur `main` déclenche sa publication. Pour préparer un changement, cloner le dépôt, installer les dépendances, vérifier le build, puis committer et pousser les modifications.

Le dossier de travail Codex `Documents/Codex/2026-07-17/je-so` ne contient pas de dépôt Git local. Pour les prochains déploiements, repartir du dépôt GitHub ci-dessus plutôt que de tenter un push depuis ce dossier.
