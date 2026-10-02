/**
 * Sections (titres) et libellés exacts enregistrés dans `practice.specialties` (cases à cocher du formulaire).
 * Regroupements indicatifs : DSM-5 / CIM-10 (chapitre F et codes apparentés). Les libellés restent des motifs de consultation, pas un codage médical.
 */

export type SpecialtyMotifSection = {
  readonly title: string;
  readonly items: readonly string[];
};

export const SPECIALTY_MOTIF_SECTIONS: readonly SpecialtyMotifSection[] = [
  {
    /* DSM-5 : neurodevelopmental ; CIM-10 F80–F89 */
    title: "Troubles neurodéveloppementaux et des apprentissages",
    items: [
      "TSA, retard de développement et mutisme sélectif",
      "TDA/H et troubles des apprentissages et du langage",
    ],
  },
  {
    /* DSM-5 : anxiety + OCD ; CIM-10 F40–F42 */
    title: "Troubles anxieux, obsessionnels et apparentés",
    items: ["Troubles anxieux et phobiques", "TOC"],
  },
  {
    /* DSM-5 : trauma- and stressor-related ; CIM-10 F43 */
    title: "Troubles liés au trauma et au stress",
    items: [
      "ESPT et adaptation au stress après événement traumatique",
      "Deuil, violences, harcèlement et troubles relationnels sévères",
    ],
  },
  {
    /* CIM-10 F30–F34 */
    title: "Troubles de l'humeur",
    items: ["Troubles dépressifs et dysthymie", "Trouble bipolaire"],
  },
  {
    /* CIM-10 F20–F29, F44 */
    title: "Troubles psychotiques et dissociatifs",
    items: ["Schizophrénie, trouble délirant et troubles dissociatifs"],
  },
  {
    /* CIM-10 F50 */
    title: "Troubles des conduites alimentaires",
    items: ["Anorexie, boulimie et troubles hyperphagiques"],
  },
  {
    title: "Comportements d'autodestruction",
    items: ["Automutilation non suicidaire"],
  },
  {
    /* CIM-10 F10–F19 et troubles liés aux addictions comportementales */
    title: "Addictions et usages problématiques",
    items: ["Addictions (substances, jeux, écrans…)"],
  },
  {
    /* Sommeil : DSM-5 insomnia etc. ; CIM-10 G47 / F51. Somatisation F45 */
    title: "Sommeil et santé somatique",
    items: ["Troubles du sommeil", "Symptômes somatiques persistants et douleur chronique"],
  },
  {
    title: "Problématiques relationnelles et de vie quotidienne",
    items: [
      "Difficultés relationnelles, familiales et isolement social",
      "Souffrance au travail, épuisement professionnel et reconversion",
    ],
  },
  {
    title: "Identité et développement personnel",
    items: ["Questionnement identitaire, estime de soi et orientation"],
  },
] as const;

export const SPECIALTY_MOTIF_ORDERED_LABELS: readonly string[] = SPECIALTY_MOTIF_SECTIONS.flatMap(
  (s) => [...s.items],
);

export const SPECIALTY_MOTIF_LABEL_SET = new Set(SPECIALTY_MOTIF_ORDERED_LABELS);
