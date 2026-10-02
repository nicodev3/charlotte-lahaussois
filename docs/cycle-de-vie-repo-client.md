# Cycle de vie d’un dépôt client

Ce template est un **point de départ**, pas un dépôt amont partagé. Un site client est créé
depuis ce dépôt (« Use this template » sur GitHub), puis **évolue de façon indépendante** :
composants ajoutés, pages propres au métier du praticien, design spécifique.

## Ce que cela implique

**Aucune synchronisation Git.** « Use this template » crée un dépôt dont l’historique n’a
aucun ancêtre commun avec celui du template. Un `git merge template/main` exigerait
`--allow-unrelated-histories` et produirait un conflit sur presque tous les fichiers, d’autant
plus que chaque site diverge dans sa structure. Ce flux n’est ni utilisé ni recommandé.

**Une correction du template ne remonte pas automatiquement.** Un correctif utile aux sites
déjà livrés se reporte à la main, fichier par fichier, sur les dépôts concernés. En pratique
cela ne vaut la peine que pour les corrections de sécurité ou de référencement.

**Le contrat de contenu appartient au template.** `schemaVersion`, le schéma Zod et les
migrations (`src/lib/client/`) ne doivent **pas** être modifiés dans un dépôt client : deux
sites qui incrémentent le compteur chacun de leur côté aboutissent à des versions portant le
même numéro pour des formats différents, et le JSON du questionnaire devient inimportable.
Un besoin propre à un client se traite dans ses composants, pas dans le contrat.

## Le seul point de contact : le questionnaire

Le site intake (`/client-config/`, déployé une fois depuis ce template) produit un
`client.json` à la version courante du template. Ce fichier s’importe dans un dépôt client
**créé depuis la même version du template** :

```sh
npm run import:client -- path/to/client.json
npm run validate:client
```

Importer un JSON plus récent que le contrat du dépôt cible échoue avec
`Unsupported schemaVersion`. C’est volontaire : cela signale que le dépôt client date d’une
version antérieure du template. Dans ce cas, corriger le contenu directement dans son
`src/data/client.json`, sans passer par l’import.

## Créer un nouveau site

1. **« Use this template »** sur GitHub à partir de la version courante du template.
2. Questionnaire `/client-config/`, puis `npm run import:client` et `npm run validate:client`.
3. Design : tokens et styles dans `src/styles/stitch.css`, polices dans `src/design/fonts.mjs`
   (voir [design-fork.md](design-fork.md)).
4. Decap CMS : `src/data/cms.json` ou `PUBLIC_GITHUB_REPO`, OAuth GitHub
   (voir [decap-cms.md](decap-cms.md)).
5. Cloudflare Pages : build `npm run build`, sortie `dist`.

À partir de là, le dépôt vit sa vie. Les évolutions du template profitent aux **prochains**
sites, pas aux précédents.
