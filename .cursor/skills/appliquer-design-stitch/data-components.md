# Mapping écrans Stitch → data-component

Référence pour appliquer les styles Stitch sur le socle Astro Nicodev.
Tous les sélecteurs utilisent l'attribut `[data-component="…"]`.

## Composants globaux (toutes les pages)

| data-component                                                          | Fichier source                      | Rôle                                     |
| ----------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `layout.base`                                                           | `src/layouts/BaseLayout.astro`      | Racine `<html>`                          |
| `ui.header-stack`                                                       | `src/components/Header.astro`       | Conteneur header                         |
| `ui.header-bar`                                                         | `src/components/HeaderTopBar.astro` | Barre supérieure (téléphone, etc.)       |
| `ui.header`                                                             | `src/components/Header.astro`       | Navigation principale                    |
| `ui.footer`                                                             | `src/components/Footer.astro`       | Pied de page                             |
| `footer.contact` / `footer.booking` / `footer.sitemap` / `footer.legal` | idem                                | Colonnes et barre légale du pied de page |
| `ui.breadcrumb`                                                         | `src/components/Breadcrumb.astro`   | Fil d'Ariane                             |

## Classes sémantiques (sans data-component)

Ciblables directement dans `stitch.css` :

| Classe                                                     | Rôle                               |
| ---------------------------------------------------------- | ---------------------------------- |
| `.cta-primary` / `.cta-secondary`                          | Boutons d'action                   |
| `.form-field`                                              | Champs de formulaire               |
| `.page` / `.page-header` / `.page-content` / `.page-block` | Structure pages intérieures        |
| `.site-container`                                          | Conteneur max-width                |
| `.section-spacing`                                         | Espacement sections homepage       |
| `.content-rich`                                            | Contenu riche (articles, mentions) |

---

## Écran Accueil → `/`

| data-component             | Fichier                                         | Bloc visuel                   |
| -------------------------- | ----------------------------------------------- | ----------------------------- |
| `home-page`                | `src/components/HomePage.astro`                 | Conteneur page accueil        |
| `section.hero`             | `src/components/HomePage.astro`                 | Wrapper section hero          |
| `HeroSection`              | `src/components/sections/HeroSection.astro`     | Titre, sous-titre, intro, CTA |
| `section.services-wrapper` | `src/components/HomePage.astro`                 | Wrapper services              |
| `section.services`         | `src/components/sections/ServicesSection.astro` | Grille services               |

---

## Écran Tarifs → `/tarifs`

Layout : `StandardPageLayout` → `data-component="page"`

| data-component            | Fichier                                        | Bloc visuel                    |
| ------------------------- | ---------------------------------------------- | ------------------------------ |
| `page`                    | `src/layouts/StandardPageLayout.astro`         | Conteneur page intérieure      |
| `pricing.list`            | `src/components/pages/TarifsPageContent.astro` | Liste des tarifs               |
| `pricing.item`            | idem                                           | Carte / ligne tarif individuel |
| `pricing.payment`         | idem                                           | Moyens de paiement             |
| `pricing.reimbursement`   | idem                                           | Section remboursement          |
| `pricing.contact-cta`     | idem                                           | CTA contact en bas de page     |
| `panel.conditions`        | `src/components/ConditionsPanel.astro`         | Conditions de consultation     |
| `conditions.cancellation` | idem                                           | Annulation                     |
| `conditions.delay`        | idem                                           | Retard                         |
| `conditions.no-show`      | idem                                           | Absence                        |
| `conditions.limits`       | idem                                           | Limites                        |
| `MonSoutienPsyCallout`    | `src/components/MonSoutienPsyCallout.astro`    | Encart Mon Soutien Psy         |

---

## Écran Contact → `/contact`

| data-component        | Fichier                                         | Bloc visuel                                             |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `page`                | `StandardPageLayout`                            | Conteneur                                               |
| `contact.info`        | `src/components/pages/ContactPageContent.astro` | Grille infos + formulaire                               |
| `contact.card`        | `src/components/ContactCard.astro`              | Coordonnées                                             |
| `contact.hours`       | `ContactPageContent.astro`                      | Horaires (wrapper)                                      |
| `contact.hours-block` | `src/components/ContactHoursBlock.astro`        | Détail horaires                                         |
| `contact.map`         | `src/components/ContactCard.astro`              | Carte Leaflet (masquée si l’adresse n’est pas géocodée) |
| `contact.form`        | `src/components/ContactForm.astro`              | Formulaire de contact                                   |

---

## Écran À propos → `/a-propos`

| data-component             | Fichier                                       | Bloc visuel            |
| -------------------------- | --------------------------------------------- | ---------------------- |
| `page`                     | `StandardPageLayout`                          | Conteneur              |
| `about.intro`              | `src/components/pages/AboutPageContent.astro` | Intro + portrait       |
| `ui.practitioner-portrait` | `src/components/PractitionerPortrait.astro`   | Photo praticien        |
| `panel.credentials`        | `src/components/CredentialsPanel.astro`       | Diplômes et formations |
| `credentials.degrees`      | idem                                          | Diplômes               |
| `credentials.trainings`    | idem                                          | Formations             |
| `credentials.affiliations` | idem                                          | Affiliations           |
| `panel.faq`                | `src/components/FaqSection.astro`             | FAQ (si présente)      |
| `faq.item`                 | idem                                          | Item FAQ (details)     |

---

## Écran Pourquoi consulter → `/pourquoi-consulter`

| data-component | Fichier                                                   | Bloc visuel      |
| -------------- | --------------------------------------------------------- | ---------------- |
| `page`         | `StandardPageLayout`                                      | Conteneur        |
| `motifs.list`  | `src/components/pages/PourquoiConsulterPageContent.astro` | Liste des motifs |
| `motifs.item`  | idem                                                      | Motif individuel |

---

## Écran Mentions légales → `/mentions-legales`

| data-component  | Fichier                                           | Bloc visuel          |
| --------------- | ------------------------------------------------- | -------------------- |
| `page`          | `StandardPageLayout`                              | Conteneur            |
| `legal.editor`  | `src/components/pages/LegalMentionsContent.astro` | Éditeur du site      |
| `legal.hosting` | idem                                              | Hébergeur            |
| `legal.privacy` | idem                                              | Données personnelles |
| `legal.cookies` | idem                                              | Cookies              |

---

## Écran Articles → `/articles` et `/articles/[slug]`

| data-component         | Fichier                            | Bloc visuel              |
| ---------------------- | ---------------------------------- | ------------------------ |
| `page`                 | pages articles                     | Conteneur                |
| `content.article-list` | `src/components/ArticleList.astro` | Liste des articles       |
| `content.article`      | `src/pages/articles/[slug].astro`  | Corps article individuel |

---

## Tokens CSS (`:root`)

Tailwind du socle mappe ces variables :

| Variable             | Usage Tailwind                                 |
| -------------------- | ---------------------------------------------- |
| `--color-bg`         | `bg-bg`                                        |
| `--color-fg`         | `text-fg`                                      |
| `--color-primary`    | `bg-primary`, `text-primary`, `border-primary` |
| `--color-primary-fg` | Texte sur fond primary                         |
| `--color-accent`     | `bg-accent`                                    |
| `--color-muted`      | `text-muted`, bordures atténuées               |
| `--radius-xl`        | `rounded-xl`                                   |
| `--font-sans`        | `font-sans`                                    |
| `--font-serif`       | `font-serif`                                   |

Déclarés dans le bloc `@theme` de `src/styles/global.css`, surchargés dans `src/styles/stitch.css` avec un bloc `:root`. Format : `--color-primary: #2563eb;` (les variantes d’opacité comme `bg-primary/20` fonctionnent). Les polices déclarées dans `src/design/fonts.mjs` exposent leur propre variable (ex. `--font-inter`) à référencer depuis `--font-sans` ou `--font-serif`.
