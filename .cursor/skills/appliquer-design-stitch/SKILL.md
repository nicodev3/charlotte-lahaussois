---
name: appliquer-design-stitch
description: >-
  Applique un export Google Stitch (HTML + Tailwind + screenshot) au socle Astro
  Nicodev via data-component et stitch.css. Utiliser quand l'utilisateur mentionne
  Stitch, design client, stitch.css, thème visuel, ou demande d'appliquer un écran
  Stitch à un repo client forké du template.
---

# Appliquer un design Google Stitch

Workflow pour les **repos client** forkés depuis le socle Nicodev. Le contenu vient de `client.json` ; le visuel vient de Stitch.

## Principes non négociables

1. **Ne jamais coller le HTML Stitch dans les fichiers `.astro`** — le markup Astro reste la source de vérité (binding `client.json`).
2. **Extraire styles et tokens uniquement** depuis l'export Stitch (HTML/Tailwind, variables CSS, polices).
3. **Cibler via `[data-component="…"]`** et les classes sémantiques du socle (`.cta-primary`, `.form-field`, `.page-block`).
4. **Ne pas modifier** `client.json`, `schema.ts`, migrations, scripts d'import, logique métier.
5. **Respecter** la rule Tailwind du projet : classes canoniques, éviter les custom values pour les tailles.

## Fichiers autorisés

| Fichier                                      | Action                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/styles/stitch.css`                      | Créer ou enrichir (styles visuels client)                                                                       |
| `src/layouts/BaseLayout.astro`               | Ajouter `import "../styles/stitch.css"` après `global.css` si absent                                            |
| `src/styles/stitch.css` → bloc `:root { … }` | Surcharger les tokens `--color-*`, `--font-*`, `--radius-xl` (valeurs neutres dans le `@theme` de `global.css`) |
| `src/design/fonts.mjs`                       | Déclarer les polices Stitch (API Fonts d'Astro : Google ou fichiers locaux)                                     |

## Fichiers interdits (sauf demande explicite)

- `src/components/**/*.astro` — pas de remplacement markup
- `src/data/client.json`
- `src/lib/client/schema.ts`, `migrations.ts`
- `src/styles/global.css` — socle structurel, ne pas y mettre le design client

---

## Workflow par écran

Stitch génère **un Screen par prompt** dans un **Project**. Traiter écran par écran.

### Étape 0 — Prérequis repo client

- [ ] Repo forké depuis le socle Nicodev
- [ ] `client.json` importé et validé (`npm run validate:client`)
- [ ] `npm run build` passe avant d'appliquer le design

### Étape 1 — Récupérer les assets Stitch

Via **MCP Stitch** (serveur natif Google) ou export manuel :

- HTML + Tailwind de l'écran cible (`screen.getHtml()`)
- Screenshot de référence (`screen.getImage()`)

Identifier le **Screen** et sa page Astro cible via [data-components.md](data-components.md).

### Étape 2 — Extraire tokens globaux (premier écran ou design system)

Depuis le HTML/CSS Stitch, extraire :

- Couleurs → variables `--color-bg`, `--color-fg`, `--color-primary`, `--color-primary-fg`, `--color-accent`, `--color-muted` (hex, ex. `#2563eb`)
- Polices → `--font-sans`, `--font-serif`
- Border radius → `--radius-xl`
- Polices → `src/design/fonts.mjs` (`fontProviders.google()` ou `fontProviders.local()`), puis `--font-sans: var(--font-<nom>)`

Déclarer les surcharges dans un bloc `:root { … }` en tête de `src/styles/stitch.css` (ne pas modifier `global.css`).

### Étape 3 — Écrire les styles dans stitch.css

Organiser par section commentée. Exemple :

```css
/* === Accueil — section.hero === */
[data-component="section.hero"] {
  /* styles extraits de Stitch */
}

[data-component="HeroSection"] h1 {
  /* typo hero */
}

/* === Composants globaux === */
[data-component="ui.header"] {
  /* … */
}
[data-component="ui.footer"] {
  /* … */
}

.cta-primary {
  /* bouton primaire Stitch */
}
.form-field {
  /* champs formulaire */
}
```

Règles d'extraction :

- Convertir les utilitaires Tailwind Stitch en CSS scoped sur `data-component` quand possible
- Réutiliser les tokens `--color-*` plutôt que des couleurs en dur
- Conserver layout structurel du socle (`.page`, `.page-block`, `space-y`, `grid`) — ne styler que l'apparence
- Pour header/footer : styler une seule fois lors du premier écran qui les contient

### Étape 4 — Brancher stitch.css

Le socle importe déjà `stitch.css` dans `BaseLayout.astro` après `global.css`. Vérifier que l'import est présent ; l'ajouter si absent dans un repo client ancien.

### Étape 5 — Valider

```sh
npm run validate:client
npm run build
npm run dev
```

Comparer mentalement ou visuellement le rendu avec le **screenshot Stitch**. Ajuster `stitch.css` jusqu'à convergence.

---

## Checklist par écran

Copier et cocher pour chaque Screen Stitch :

```
Écran Stitch : _______________
Page Astro   : _______________

- [ ] HTML + screenshot récupérés
- [ ] Mapping data-component identifié (voir data-components.md)
- [ ] Styles ajoutés dans stitch.css (pas dans .astro)
- [ ] Tokens mis à jour si nouveau design system
- [ ] Polices installées si nécessaire
- [ ] build OK
- [ ] Rendu cohérent avec screenshot
```

---

## Ordre recommandé pour un site complet

1. **Accueil** — tokens globaux + header + footer + hero
2. **Tarifs** — cartes pricing, conditions
3. **Contact** — formulaire, carte, horaires
4. **À propos** — portrait, parcours, credentials
5. **Pourquoi consulter** — liste motifs
6. **Mentions légales** — blocs legal.*
7. **Articles** (si présent) — liste et page article

Les composants globaux (`ui.header`, `ui.footer`) se stylent lors de l'écran Accueil ; les écrans suivants ne les re-stylent que si Stitch diverge.

---

## Prompts Stitch recommandés

Lors de la création des écrans dans Stitch, inclure dans le prompt :

- Type de page (accueil cabinet praticien, page tarifs, etc.)
- Structure sémantique attendue (hero, cartes tarifs, formulaire contact)
- Mentionner que le HTML servira de **référence visuelle** mappée sur des hooks `data-component`

Exemple prompt Accueil :

> Page d'accueil pour un psychologue / thérapeute. Hero avec nom et ville, sous-titre, deux CTA (prendre rendez-vous, me contacter), section services en cartes. Style chaleureux, professionnel, responsive desktop et mobile.

---

## Dépannage

| Problème                                                                    | Action                                                                                                                                                |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Couleurs Tailwind du socle (`text-fg`, `bg-primary`) ne matchent pas Stitch | Vérifier le bloc `:root` de `stitch.css` — Tailwind du socle lit `--color-*` ; `npm run check:contrast src/styles/stitch.css` vérifie l’accessibilité |
| Layout cassé                                                                | Ne pas override `display`, `grid`, `flex` structurels du socle ; styler couleurs, typo, ombres, bordures                                              |
| Boutons incohérents                                                         | Styler `.cta-primary`, `.cta-secondary` globalement dans stitch.css                                                                                   |
| Typo différente                                                             | Surcharger `h1`, `h2`, `p`, `.lead`, `.note` globalement ou via `[data-component="…"] h2`                                                             |
| Stitch a du contenu en dur                                                  | Ignorer le texte ; le site affiche `client.json`                                                                                                      |

---

## Ressources

- Mapping écran → data-component : [data-components.md](data-components.md)
- Doc socle : `docs/design-fork.md`
