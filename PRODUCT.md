# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adultes et grands adolescents, ainsi que des entreprises, qui recherchent un accompagnement face à des problématiques personnelles ou professionnelles. Les personnes peuvent consulter au cabinet ou en visioconférence.

## Product Purpose

Le site présente la pratique de Charlotte Lahaussois, psychologue-psychothérapeute, et permet aux personnes concernées de comprendre l’accompagnement proposé puis de prendre contact. Le succès consiste à rendre le cadre, les approches et les modalités de consultation compréhensibles sans promettre de résultat.

## Positioning

Une pratique intégrative qui associe la psychologie du travail et la psychothérapie. L’accompagnement considère chaque personne dans son système propre et unique, notamment dans les problématiques personnelles, professionnelles, de trauma et d’attachement. La thérapie LI-ICV (Lifespan Integration / Intégration du cycle de la vie) fait partie des outils présentés pour travailler l’intégration d’événements vécus et le lien entre l’esprit et le corps.

## Operating Context

Les consultations sont proposées au cabinet à Versailles / Le Chesnay et en visioconférence. Le site renseigne les motifs de consultation, les approches, les tarifs, les conditions de séance, les informations pratiques et les moyens de contact.

## Capabilities and Constraints

- Site statique Astro, avec contenu client centralisé dans `src/data/client.json` et CMS Decap pour une partie du contenu.
- Public annoncé : adultes et adolescents ; les textes existants précisent « grands adolescents (à partir du lycée) ».
- Langues proposées : français et anglais.
- Les informations factuelles de santé, qualifications, disponibilité, tarifs et modalités doivent être conservées et ne jamais être inventées ou modifiées sans validation.
- Le site ne doit pas promettre de résultat thérapeutique.

## Brand Commitments

Charlotte Lahaussois est présentée comme « Psychologue-Psychothérapeute ». La voix doit rester à l’écoute, sans jugement, respectueuse de la liberté, de la responsabilité et de l’unicité de chaque personne.

## Evidence on Hand

- Données professionnelles, modalités, coordonnées, qualifications et tarifs : `src/data/client.json`.
- Présentation de la praticienne : `src/components/pages/AboutPageContent.astro`, alimentée par `client.aboutPage`.
- Contenus éditoriaux : `src/content/`.
- Aucun témoignage, résultat chiffré, label supplémentaire ou preuve externe ne doit être fabriqué.

## Product Principles

- Donner un cadre rassurant, clair et sans promesse excessive.
- Respecter la singularité des situations et des parcours.
- Rendre les informations pratiques faciles à trouver avant la prise de contact.
- Présenter avec justesse l’articulation entre vie personnelle et professionnelle.

