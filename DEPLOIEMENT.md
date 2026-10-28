# Déploiement

- **Dépôt GitHub :** [come-de/to-do-alpha](https://github.com/come-de/to-do-alpha)
- **Branche de production :** `main`
- **Site Netlify :** [orga-victoire.netlify.app](https://orga-victoire.netlify.app)
- **Configuration de build :** `netlify.toml` (`pnpm run build:netlify`, publication depuis `.next`)

Le site Netlify est relié au dépôt GitHub : un push sur `main` déclenche sa publication. Pour préparer un changement, cloner le dépôt, installer les dépendances, vérifier le build, puis committer et pousser les modifications.

Le dossier de travail Codex `Documents/Codex/2026-07-17/je-so` ne contient pas de dépôt Git local. Pour les prochains déploiements, repartir du dépôt GitHub ci-dessus plutôt que de tenter un push depuis ce dossier.

## Envoi des e-mails

Les notifications d’attribution et de clôture des tâches sont envoyées par l’API SendGrid. Dans les variables d’environnement du site Netlify, renseigner :

- `SENDGRID_API_KEY` : clé API SendGrid gardée secrète, avec le droit d’envoi d’e-mails (`Mail Send`). Ne pas la mettre dans le code ni dans une variable préfixée `NEXT_PUBLIC_`.
- `ASSIGNMENT_FROM_EMAIL` : adresse expéditrice vérifiée dans SendGrid.
- `SENDGRID_REPLY_TO_EMAIL` : adresse de réponse pour les e-mails envoyés par SendGrid (facultative, distincte des autres réglages `ASSIGNMENT_*`).

Les récapitulatifs de bilans manquants utilisent leur propre expéditeur, `tuteurs@etudealpha.com`, sans modifier l’expéditeur des autres notifications. Cette adresse ou le domaine `etudealpha.com` doit être authentifié dans SendGrid.

Dans SendGrid, authentifier le domaine expéditeur (recommandé pour la production), puis créer une clé API limitée à l’envoi. Définir les variables dans **Netlify → Site configuration → Environment variables**, pour le contexte **Production** (et **Deploy previews** seulement si les e-mails doivent aussi partir des prévisualisations). Une nouvelle publication est nécessaire pour que les fonctions serveur utilisent les valeurs ajoutées ou modifiées. Sans clé ou expéditeur configuré, les notifications restent désactivées.
