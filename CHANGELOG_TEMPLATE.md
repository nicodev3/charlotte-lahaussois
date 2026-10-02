# Changelog Template

Ce fichier suit les evolutions du template de base.
Format inspire de Keep a Changelog + SemVer.

## [Unreleased]

- Documentation du cycle de vie réel d’un repo client (`docs/cycle-de-vie-repo-client.md`) : pas de synchronisation Git depuis le template, contrat de contenu réservé au template. `docs/sync-depuis-template.md` supprimé (flux inutilisé et impraticable : historiques sans ancêtre commun).

- Sitemap (`@astrojs/sitemap`) et `robots.txt` générés depuis `seo.baseUrl` ; `site` dans `astro.config.mjs`.
- Tailwind v4 natif (`@theme` dans `global.css`, plus de `tailwind.config.js`) : tokens en hex, `--radius-xl`.
- Typographie par élément (`@layer base`), variantes `.lead` / `.note` ; `typography.ts` et `cn.ts` supprimés.
- Contrat v25 : `nav` retiré de `client.json`, le menu vient des exports `pageNav` des pages Astro.
- `astro:env` : variables d’environnement validées au build (`PUBLIC_NOINDEX` booléen strict).
- API Fonts d’Astro : `src/design/fonts.mjs` (vide par défaut), préchargement dans le layout.
- Médias Decap dans `src/assets/uploads/` (chemins relatifs) → optimisés par `astro:assets`.
- Prettier + `prettier-plugin-astro` (`npm run format`).
- Revue de maintenabilité : tokens de thème déclarés en CSS (`global.css` → surcharge `:root` dans `stitch.css`) au lieu d’un style inline sur `<body>` ; JSON-LD principal réellement émis (était rendu comme code source) ; `og:image` ; section « parcours » fictive retirée de la page À propos ; carte contact masquée si l’adresse n’est pas géocodée (plus de coordonnées par défaut) ; navigation partagée header/footer (`siteNavigation.ts`) ; fil d’Ariane sans rechargement des collections ; icônes unifiées via `@lucide/astro` ; runner de migrations piloté par table ; suppression du code mort (sections statiques, PracticePanel, heroHighlightBullets…) ; `npm run check` (`astro check`) sans erreur.
- Decap CMS : le client édite les articles, le chapô/introduction de l’accueil et les prestations tarifaires. FAQ et autres pages restent dans le template / `client.json`.

## [0.1.0] - 2026-02-24

- Base Astro + Tailwind v4 pour sites psychologues.
- Systeme `client.json` + validation Zod.
- Sections homepage dynamiques (`enabled`, `order`, `variant`, `data`).
- Templates visuels A et B.
- Validation CLI `npm run validate:client`.
- Build gate: `npm run build` valide les donnees avant `astro build`.
- Versionning schema + migrations (`v0 -> v1 -> v2`).
- Ajout du champ `templateVersion` pour le suivi multi-repos.

## Convention de release

- `MAJOR`: changement cassant dans schema/renderer.
- `MINOR`: nouvelle fonctionnalite retrocompatible.
- `PATCH`: correction sans impact de contrat.
