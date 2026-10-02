# Reference systeme

Ce repo est un template Astro + TailwindCSS a design fixe. Il sert de base a un site client cree via GitHub **Use this template**.

## Philosophie

- Un repo socle = structure Astro + contrat de contenu.
- Un repo client = fork du socle + `client.json` + design Stitch (`stitch.css`).
- `src/data/client.json` = contenu client uniquement.
- Les choix visuels ne sont pas configurables dans le JSON.
- Le design client est appliqué via Google Stitch et le skill `.cursor/skills/appliquer-design-stitch/`.

## Flux de production

1. Le client choisit un design.
2. Creer le repo client depuis le repo template correspondant.
3. Faire remplir le questionnaire sur `/client-config/` (site intake + Web3Forms — voir README).
4. Recuperer le JSON (e-mail ou fichier telecharge) et l’importer :

   ```sh
   npm run import:client -- path/to/client.json
   ```

5. Valider :

   ```sh
   npm run validate:client
   ```

6. Builder :

   ```sh
   npm run build
   ```

La sortie de production est `dist`.

## Contrat de contenu

Le schema Zod vit dans `src/lib/client/schema.ts`. Les migrations vivent dans
`src/lib/client/migrations.ts`. Ces deux fichiers ne se modifient que dans ce depot :
un repo client qui ajoute sa propre migration cree un numero de version en conflit avec
celui du template et rend le JSON du questionnaire inimportable.

Champs de design retires du contrat :

- `template`
- `templateVersion`
- `stylePreset`
- `colorTheme`
- `theme`

Voir `docs/content-contract.md` pour le detail du format attendu.

## Decap CMS

Apres l’intake (`/client-config/`), le client edite sur `/admin/` ses articles, le chapo d’accueil et ses tarifs. Le reste reste dans le template et `client.json`. Voir `docs/decap-cms.md`.

## Cycle de vie des repos clients

Un repo client est une copie du template a un instant donne, qui evolue ensuite de facon
independante : pas de remote `template`, pas de merge depuis ce depot. Les corrections du
template profitent aux prochains sites. Le contrat de contenu (`schemaVersion`, schema Zod,
migrations) appartient au template et ne doit pas etre modifie dans un repo client.
Voir `docs/cycle-de-vie-repo-client.md`.
