import { REGISTERED_PRACTICE_PAGES, type PracticePageId } from "./practicePageRegistry.ts";

/** Familles d’affichage de l’onglet « Votre offre de soins » (fichier séparé du registre pour limiter les rechargements HMR SSR). */
export const PRACTICE_OFFER_FORM_FAMILIES = [
  {
    id: "cbtThirdWave",
    label: "Cognitivo-comportementales et troisième vague",
    practicePageIds: [
      "tcc",
      "act",
      "dbt",
      "schemaTherapy",
      "mbct",
      "rebt",
      "exposureTherapy",
      "mindfulnessMbsr",
      "motivationalInterviewing",
      "ipt",
    ],
  },
  {
    id: "humanisticExperiential",
    label: "Humanistes et expérientielles",
    practicePageIds: ["personCentered", "gestalt", "existential"],
  },
  {
    id: "psychodynamicAnalytic",
    label: "Psychodynamiques et psychanalytiques",
    practicePageIds: ["psychodynamic", "psychoanalytic"],
  },
  {
    id: "systemicCoupleEft",
    label: "Systémique, couple et thérapie focalisée sur les émotions",
    practicePageIds: ["systemicFamily", "coupleTherapy", "eft"],
  },
  {
    id: "briefNarrative",
    label: "Thérapies brèves et narratives",
    practicePageIds: ["briefTherapy", "solutionFocused", "narrativeTherapy", "strategicTherapy"],
  },
  {
    id: "integrativeTechniques",
    label: "Intégrative et techniques spécifiques",
    practicePageIds: ["integrative", "emdr", "clinicalHypnosis"],
  },
  {
    id: "creativeMediation",
    label: "Médiations créatives",
    practicePageIds: ["playTherapy", "artTherapy", "clayField"],
  },
  {
    id: "sexology",
    label: "Sexologie",
    practicePageIds: ["sexTherapy"],
  },
] as const;

export type PracticeOfferFormFamilyId = (typeof PRACTICE_OFFER_FORM_FAMILIES)[number]["id"];

function assertPracticeOfferFormFamiliesComplete(): void {
  const familyIds = new Set<string>();
  for (const fam of PRACTICE_OFFER_FORM_FAMILIES) {
    if (familyIds.has(fam.id)) {
      throw new Error(`practice offer form family: duplicate family id "${fam.id}"`);
    }
    familyIds.add(fam.id);
  }
  const covered = new Set<PracticePageId>();
  for (const fam of PRACTICE_OFFER_FORM_FAMILIES) {
    for (const id of fam.practicePageIds) {
      if (covered.has(id)) {
        throw new Error(`practice offer form family: duplicate practice page id "${id}"`);
      }
      covered.add(id);
    }
  }
  for (const t of REGISTERED_PRACTICE_PAGES) {
    if (!covered.has(t.id)) {
      throw new Error(`practice offer form family: page "${t.id}" is not assigned to any family`);
    }
  }
  if (covered.size !== REGISTERED_PRACTICE_PAGES.length) {
    throw new Error(
      "practice offer form family: id count does not match REGISTERED_PRACTICE_PAGES",
    );
  }
}

assertPracticeOfferFormFamiliesComplete();
