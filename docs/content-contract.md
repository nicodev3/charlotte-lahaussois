# Contrat de contenu client

Ce repo template porte un design fixe. Le fichier `src/data/client.json` ne doit contenir que les donnees client et les choix de contenu affichable.

## Source attendue

Le JSON doit être compatible avec `src/lib/client/schema.ts`.

### Flux recommandé : page `/client-config/`

1. Déployer le template (site intake) avec `PUBLIC_WEB3FORMS_ACCESS_KEY` (voir README et `.env.example`).
2. Envoyer à la cliente l’URL `…/client-config/`.
3. Elle envoie ses réponses par e-mail (**« Envoyer mes réponses »**) ou télécharge une copie.
4. Importer le fichier :

```sh
npm run import:client -- path/to/client.json
```

5. `npm run validate:client` puis `npm run build` sur le repo client.

Le script d'import applique les migrations, valide le schema Zod, puis remplace `src/data/client.json`.

### Alternative : Google Forms

Pour le flux Google Forms généré depuis `form-schema.json`, voir `docs/google-form-workflow.md`.

## Donnees autorisees

Le contrat accepte notamment :

- `profession`
- `business`
- `social`
- `practice`
- `credentials`
- `conditions`
- `seo`
- `practicePageEnabled`
- `practiceOfferCustomApproaches`
- `aboutPage`
- `contact`
- `pricing`

## Donnees exclues

Le menu du site n’est pas dans le contrat : il est dérivé des pages Astro (`export const pageNav` dans `src/pages/*.astro`) et des pages pratique activées.

Les champs de design ne font plus partie du contrat de contenu :

- `template`
- `templateVersion`
- `stylePreset`
- `colorTheme`
- `theme`

Chaque repo template fixe son design dans le code Astro, Tailwind et CSS. Pour proposer une autre apparence, creer un autre repo GitHub template avec le meme contrat de contenu.
