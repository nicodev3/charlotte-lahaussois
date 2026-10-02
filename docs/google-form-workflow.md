# Workflow Google Forms

> **Flux recommandé :** questionnaire intégré `/client-config/` + Web3Forms (voir le README). Ce document décrit l’**alternative** Google Forms.

Ce workflow permet de creer un questionnaire Google Forms depuis `form-schema.json`, puis de transformer les reponses CSV en `src/data/client.json`.

Le formulaire collecte uniquement les donnees structurees du praticien. Les textes editoriaux longs et les champs de referencement SEO sont destines a etre geres dans une interface d'administration separee, par exemple Decap CMS.

## 1. Generer le script Apps Script

Depuis le repo :

```sh
npm run form:google:script
```

La commande cree :

```text
generated/google-form-generator.gs
```

Ce fichier est genere, il ne contient pas de secret.

## 2. Creer le formulaire Google

1. Ouvrir <https://script.google.com/>.
2. Creer un nouveau projet.
3. Remplacer le contenu de `Code.gs` par le contenu de `generated/google-form-generator.gs`.
4. Cliquer sur **Run** avec la fonction `createClientIntakeForm`.
5. Autoriser le script avec ton compte Google.
6. Ouvrir **Executions** ou **Logs** pour recuperer :
   - `Public URL` : lien a envoyer au client.
   - `Responses Sheet` : feuille Google Sheets des reponses.
   - `Form URL` : lien d'edition du formulaire.

Le script cree aussi automatiquement une Google Sheet reliee au formulaire.

Les questions visibles dans Google Forms utilisent seulement les libelles de `form-schema.json`, par exemple `Nom complet`. Les identifiants techniques comme `business.fullName` restent dans le schema et servent uniquement a l'import CSV.

## 3. Recuperer les reponses

Dans la Google Sheet des reponses :

1. Ouvrir **File**.
2. Choisir **Download**.
3. Choisir **Comma-separated values (.csv)**.
4. Placer le fichier dans un dossier local, par exemple `exports/responses.csv`.

## 4. Importer dans le site

Pour importer la derniere reponse du CSV :

```sh
npm run import:google-form -- exports/responses.csv
```

Pour importer une ligne precise, utiliser un index 1-based parmi les reponses, hors ligne d'en-tete :

```sh
npm run import:google-form -- exports/responses.csv --row=2
```

Puis verifier :

```sh
npm run validate:client
npm run build
```

## 5. Maintenir le questionnaire

Modifier uniquement `form-schema.json`, puis regenerer :

```sh
npm run form:google:script
```

Pour une modification majeure, recreer un formulaire. Pour une petite modification, tu peux aussi modifier le formulaire Google existant a la main, mais le plus maintenable reste de garder `form-schema.json` comme source de verite.

Important : si tu modifies les titres directement dans Google Forms, garde les memes libelles que dans `form-schema.json`, ou reporte la modification dans `form-schema.json` puis regenere le script. L'import CSV utilise ces libelles pour retrouver les champs.

## Formats de champs libres

Pour les champs multi-lignes :

- Une ligne = une entree.

Pour les approches principales, le formulaire Google limite la selection a 6 choix maximum. Ces choix alimentent `practicePageEnabled`, puis `practice.approaches` est recalcule automatiquement par le schema client.

Le champ libre `Autre approche ou precision` alimente `practiceOfferCustomApproaches.integrativeTechniques`.

Pour les diplomes et formations :

```text
Intitule | Etablissement ou organisme | Annee
```

Pour les tarifs, le formulaire genere des champs structures pour trois prestations : nom, prix, duree et precision optionnelle. Ajoute plus de prestations dans `form-schema.json` en copiant le groupe `pricing.items.2.*` et en incrementant l'index.
