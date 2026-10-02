# Decap CMS

Le template embarque [Decap CMS](https://decapcms.org) pour que le **client** édite ses articles, le chapô/introduction de l’accueil, et ses prestations tarifaires.

Le socle visuel, la FAQ, les pages À propos / Contact / Pourquoi consulter / Mentions légales, et les données d’identité restent du côté **développeur** (`client.json` + template). `client.json` n’est pas éditable dans le CMS.

L’interface est sur **`/admin/`**. Chaque enregistrement crée un commit GitHub ; Cloudflare Pages rebuild le site.

## Collections

Le CMS est réservé au **client** (praticien). Le **développeur** gère le reste dans le template Astro et dans `client.json`.

| Collection        | Fichiers                               | Qui                                      | Création                                                          |
| ----------------- | -------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| Articles          | `src/content/pages/*.md`               | Client                                   | oui                                                               |
| Accueil           | `src/content/site-copy/accueil.md`     | Client (chapô + introduction uniquement) | non                                                               |
| Tarifs            | `src/content/site-copy/tarifs.md`      | Client (prestations / prix uniquement)   | non                                                               |
| Pages d’approches | `src/content/practice-pages/{slug}.md` | Client                                   | uniquement si `practicePageEnabled` est `true` dans `client.json` |

La collection « Pages d’approches » est générée au build : une page n’apparaît dans `/admin/` qu’après `practicePageEnabled.<id>: true` **et** un rebuild. Si aucune approche n’est activée, la collection est absente.

### Hors CMS (développeur)

| Surface                                                                           | Source                   |
| --------------------------------------------------------------------------------- | ------------------------ |
| FAQ, titre H1, sous-titre hero                                                    | Template + `client.json` |
| À propos, contact, pourquoi consulter, mentions légales, liste d’articles         | Template + `client.json` |
| Chapô / textes de pages tarifs (hors prestations), moyens de paiement, conditions | Template + `client.json` |
| Identité, horaires, SEO                                                           | `client.json`            |

Les prestations affichées sur `/tarifs/` viennent du CMS. Si la liste CMS est vide, le site retombe sur `client.pricing.items` (questionnaire).

## Local (sans GitHub)

Deux processus sont nécessaires :

```sh
npm run dev:cms
```

Ou, dans deux terminaux : `npm run dev` et `npm run cms` (`decap-server` sur le port 8081).

Ouvrir `http://localhost:4321/admin/` (pas `127.0.0.1` : le backend local de Decap ne s’active que sur `localhost`).

## Production (chaque repo client)

### 1. Dépôt GitHub

Decap résout `owner/repo` dans cet ordre :

1. variable `PUBLIC_GITHUB_REPO`
2. `src/data/cms.json` → `githubRepo` (si non vide)
3. remote Git `origin`

Dans un site créé par **Use this template**, `origin` suffit en général. Sinon, dans `src/data/cms.json` :

```json
{
  "githubRepo": "votre-org/cabinet-client",
  "branch": "main"
}
```

Sur Cloudflare Pages, ajouter aussi `PUBLIC_GITHUB_REPO` si le remote n’est pas détecté au build.

### 2. Application GitHub OAuth

GitHub exige un échange serveur du `client_secret`. Le template fournit des **Pages Functions** :

- `/api/auth` — redirection GitHub
- `/api/callback` — jeton renvoyé à Decap

Pour **chaque site client** (mode autonome) :

1. [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) → **New OAuth App**
2. **Homepage URL** : `https://domaine-du-client`
3. **Authorization callback URL** : `https://domaine-du-client/api/callback`
4. Copier **Client ID** et générer un **Client Secret**
5. Cloudflare Pages → Settings → Environment variables (Production **et** Preview) :
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET` (secret)
   - éventuellement `PUBLIC_GITHUB_REPO=org/repo`

Rebuild, puis ouvrir `https://domaine-du-client/admin/` et se connecter avec un compte GitHub qui a le droit d’écrire sur le dépôt.

### 3. Une OAuth App pour tous les clients (recommandé en agence)

Déployer **un** proxy OAuth (Worker) avec une seule GitHub OAuth App dont le callback pointe vers ce proxy. Sur chaque site :

```
PUBLIC_DECAP_OAUTH_BASE_URL=https://cms-auth.votre-domaine.fr
```

Les Pages Functions du repo ne sont alors pas utilisées. Voir par exemple [decap-proxy](https://github.com/sterlingwes/decap-proxy).

## Droits GitHub

Le scope demandé est `repo` (dépôts privés). Le compte qui se connecte doit pouvoir pousser sur la branche configurée (`main` par défaut).

## Médias

Les images du CMS sont enregistrées dans `src/assets/uploads/` et référencées en chemin relatif depuis le Markdown (`../../assets/uploads/photo.jpg`). Astro les optimise au build (redimensionnement, formats modernes) via `astro:assets`, comme le portrait du praticien.

## Contenus propres au client

Les fichiers édités via le CMS (`src/content/pages/`, `src/content/site-copy/`,
`src/assets/uploads/`) appartiennent au dépôt du client et n’existent que là. Ils ne sont
jamais écrasés par le template, puisqu’un site client ne se synchronise pas avec ce dépôt
(voir [cycle-de-vie-repo-client.md](./cycle-de-vie-repo-client.md)). Si vous reportez à la
main un correctif du template, laissez ces chemins de côté.
