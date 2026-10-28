# Nicodev Template Astro

Socle structurel Astro + TailwindCSS pour sites praticiens. Le contenu client est porté par `src/data/client.json` ; l'apparence est appliquée par repo client via `src/styles/stitch.css` (tokens `:root` + styles sur les hooks `data-component`, Google Stitch + MCP Cursor). Voir `docs/design-fork.md`.

## Flux client

### Faire remplir le questionnaire (recommandé)

Le questionnaire vit sur la page **`/client-config/`** du site. L’envoi des réponses passe par [Web3Forms](https://web3forms.com) (e-mail vers toi, sans serveur dédié).

**Setup une fois**

1. Créer une clé gratuite sur [web3forms.com](https://web3forms.com) avec **ton** e-mail de réception.
2. Déployer ce template sur Cloudflare Pages (site « intake » réutilisable pour toutes les clientes).
3. Dans Cloudflare Pages → **Settings → Environment variables** (Build + Production) :
   - `PUBLIC_WEB3FORMS_ACCESS_KEY` = ta clé (sans elle, le bouton d’envoi n’apparaît pas)
   - `PUBLIC_NOINDEX=true` (éviter l’indexation de ce site d’intake)
4. Rebuild le projet Pages.

En local : copier `.env.example` → `.env`, renseigner la clé, puis `npm run dev` et ouvrir `http://localhost:4321/client-config/`.

**Pour chaque cliente**

1. Lui envoyer : `https://<ton-projet>.pages.dev/client-config/`
2. Elle remplit les onglets, puis clique **« Envoyer mes réponses »** une fois le formulaire terminé.
3. Tu reçois le JSON par e-mail (vérifier aussi les spams).
4. Sur le **repo client**, importer :

```sh
npm run import:client -- path/to/client.json
npm run validate:client
npm run build
```

Si l’envoi e-mail échoue, elle peut utiliser **« Télécharger une copie »** et te renvoyer le fichier.

Voir [docs/content-contract.md](docs/content-contract.md) pour le contrat JSON.
Alternative Google Forms : [docs/google-form-workflow.md](docs/google-form-workflow.md).

## Structure

```text
/
├── public/
├── functions/          # OAuth GitHub pour Decap (Cloudflare Pages)
├── src/
│   ├── data/client.json
│   ├── data/cms.json
│   ├── pages/
│   ├── components/
│   └── lib/client/
└── package.json
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command                               | Action                                                                     |
| :------------------------------------ | :------------------------------------------------------------------------- |
| `npm install`                         | Installs dependencies                                                      |
| `npm run dev`                         | Starts local dev server at `localhost:4321`                                |
| `npm run import:client -- <json>`     | Imports and validates form JSON into `src/data/client.json`                |
| `npm run form:google:script`          | Generates the Google Apps Script form creator                              |
| `npm run import:google-form -- <csv>` | Imports a Google Forms responses CSV into `src/data/client.json`           |
| `npm run validate:client`             | Validates the content contract                                             |
| `npm run check`                       | Type-check Astro + TypeScript (`astro check`)                              |
| `npm run format`                      | Formate le code avec Prettier (`format:check` en CI)                       |
| `npm run check:contrast [css]`        | WCAG AA contrast of `--color-*` tokens (socle, or a `stitch.css` override) |
| `npm run cms`                         | Proxy Git local Decap (`localhost:8081`)                                   |
| `npm run dev:cms`                     | Astro + Decap ensemble (édition via `/admin/`)                             |
| `npm run build`                       | Build your production site to `./dist/`                                    |
| `npm run preview`                     | Preview your build locally, before deploying                               |
| `npm run astro ...`                   | Run CLI commands like `astro add`, `astro check`                           |
| `npm run astro -- --help`             | Get help using the Astro CLI                                               |

## Déploiement (Cloudflare Pages)

Le site est statique (Astro SSG) : la sortie de production est le dossier **`dist`**. `sitemap-index.xml` et `robots.txt` sont générés à partir de `seo.baseUrl` (`client.json`) ; `/admin/` et `/client-config/` en sont exclus.

1. Dans le [dashboard Cloudflare](https://dash.cloudflare.com/) : **Workers & Pages** → **Create** → **Pages** → connecter le dépôt Git.
2. **Build command** : `npm run build`
3. **Build output directory** : `dist`
4. Utiliser Node.js 24.22.0 ou version ultérieure. Cloudflare Pages peut aussi être configuré avec la variable d’environnement du projet `NODE_VERSION=24.22.0`.

Domaine personnalisé : **Custom domains** sur le projet Pages, puis DNS selon l’assistant Cloudflare.

## Decap CMS (édition du contenu)

Chaque site dérivé du template a une interface d’édition sur **`/admin/`** : articles, chapô/introduction de l’accueil, prestations tarifaires. Le reste (FAQ, autres pages, `client.json`) est géré dans le template. En local : `npm run dev:cms`. Détail : [docs/decap-cms.md](docs/decap-cms.md).

## Sites dérivés du template

Un site client est créé via **« Use this template »** puis évolue de façon autonome : il n'y a pas de synchronisation Git avec ce dépôt, et les corrections apportées ici profitent aux prochains sites, pas aux précédents. Le contrat de contenu (`schemaVersion`, schéma Zod, migrations) reste la propriété du template et ne doit pas être modifié dans un dépôt client. Détail : **[docs/cycle-de-vie-repo-client.md](docs/cycle-de-vie-repo-client.md)**.

## Icônes (Lucide)

Les icônes utilisent le package officiel **`@lucide/astro`** (composants SVG tree-shakables). Pour en ajouter une, voir la section **5.1)** dans [`REFERENCE_SYSTEME.md`](REFERENCE_SYSTEME.md).

## Reprendre le design sur une autre machine

Le dépôt conserve le contexte nécessaire pour poursuivre le travail avec Impeccable :

- `PRODUCT.md` : public, positionnement et contraintes du site.
- `DESIGN.md` et `.impeccable/design.json` : système visuel et composants.
- `.impeccable/config.json` : préférences partagées, dont la création directement dans le code.
- `.impeccable/surfaces/` : briefs et décisions propres aux pages.
- `.cursor/skills/impeccable/`, `.cursor/agents/impeccable-*.md` et `.cursor/hooks.json` : instructions, lanceurs et intégration Cursor.

Après avoir cloné le dépôt et installé les dépendances avec `npm ci`, démarrer le site avec `npm run dev`. Pour charger le contexte Impeccable depuis la racine du projet :

```powershell
# Windows / PowerShell
& .\.cursor\skills\impeccable\scripts\impeccable.cmd context
```

```sh
# macOS / Linux
sh .cursor/skills/impeccable/scripts/impeccable context
```

Le binaire n’est pas versionné : le lanceur le récupère au besoin dans le cache utilisateur et vérifie son empreinte à partir du manifeste fourni. Ce premier téléchargement nécessite un accès réseau. Les captures, journaux, choix intermédiaires et réglages locaux Impeccable sont ignorés par Git ; ils ne sont pas nécessaires pour reprendre le projet.

## Ressources

Documentation Astro : <https://docs.astro.build>.
