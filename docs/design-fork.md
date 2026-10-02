# Personnaliser le design (repo fork)

Ce dépôt est un **socle structurel** : contenu dans `client.json`, présentation dans le CSS et les composants du fork.

## Où modifier le visuel

| Zone                      | Fichier / hook                                                                                     | Rôle                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Couleurs, polices, radius | Bloc `:root { … }` dans `src/styles/stitch.css` (valeurs neutres dans le `@theme` de `global.css`) | Tokens `--color-*`, `--font-*`, `--radius-xl`, aussi exposés en utilitaires Tailwind |
| Fichiers de polices       | `src/design/fonts.mjs` (API Fonts d’Astro)                                                         | Téléchargement, self-hosting, préchargement, fallbacks                               |
| Composants réutilisables  | `src/styles/global.css` (`@layer components`)                                                      | `.page`, `.page-block`, `.cta-primary`, `.form-field`, etc.                          |
| Pages intérieures         | `StandardPageLayout` + `data-component` sur les blocs                                              | Structure HTML minimale ; styles visuels via fork (ex. Google Stitch)                |
| Typographie               | `@layer base` de `global.css` (h1…h6, body) + `.lead`, `.note`                                     | Échelle neutre par élément, surchargeable en CSS                                     |
| Override ciblé            | Attributs `data-component="…"`                                                                     | Cibler un bloc sans toucher au markup                                                |

## Pages

Les fichiers dans `src/pages/` ne doivent contenir que :

- `pageNav` (menu),
- le layout (`StandardPageLayout` ou `BaseLayout`),
- un composant `src/components/pages/*PageContent.astro`.

Le markup et le style détaillé vivent dans les composants, pas dans les routes.

## Pages intérieures et Google Stitch

Les pages (`tarifs`, `contact`, `mentions-legales`, `a-propos`, etc.) exposent une structure sémantique légère :

- `.page` / `.page-header` / `.page-content` / `.page-block` — espacement uniquement
- `data-component="…"` sur chaque bloc (ex. `pricing.list`, `legal.editor`, `contact.form`)
- Titres et paragraphes sans classe : tailles par élément dans `global.css`, variantes `.lead` (chapô) et `.note` (mention)

Dans un fork, coller ou importer le CSS généré par Stitch en ciblant `[data-component="…"]` ou les sélecteurs de structure. Ne pas réintroduire de classes décoratives dans le template.

## Fork typique

1. Dupliquer le repo template.
2. Déclarer les polices dans `src/design/fonts.mjs`, puis surcharger les tokens dans `stitch.css` (`:root { --color-primary: …; --font-sans: var(--font-inter); }`).
3. Enrichir `stitch.css` (importé par `BaseLayout.astro` après `global.css`) avec les styles Stitch pour les pages intérieures.
4. Laisser `client.json` inchangé côté structure (schéma partagé).

Ne pas réintroduire de champs « thème » dans `client.json` : un design = un repo.
