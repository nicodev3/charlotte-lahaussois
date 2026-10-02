import type { ClientProfession } from "./profession.ts";

/** Préfixe du sous-titre hero (avant la liste publics + modes). */
export function professionHeroConsultationPrefix(profession: ClientProfession): string {
  if (profession === "psychomotricien") {
    return "Consultations de psychomotricité pour ";
  }
  return "Consultations de psychologie pour ";
}

/** Libellé SEO du cabinet, dérivé du métier renseigné dans `client.json`. */
export function professionSeoCabinetLabel(profession: ClientProfession): string {
  return profession === "psychomotricien" ? "Cabinet de psychomotricité" : "Cabinet de psychologie";
}

/** Lien pied de page vers un texte de déontologie officiel ; `null` = pas de lien (ex. psychomotricien). */
export function professionDeontologieFooterLink(profession: ClientProfession): {
  label: string;
  href: string;
} | null {
  if (profession === "psychomotricien") {
    return null;
  }
  return {
    label: "Code de déontologie",
    href: "https://www.codededeontologiedespsychologues.fr/",
  };
}

export function professionConditionsConfidentialitySummary(profession: ClientProfession): string {
  if (profession === "psychomotricien") {
    return "Le cadre est confidentiel dans le respect du secret professionnel et des obligations légales attachées à l’exercice de la psychomotricité.";
  }
  return "Le cadre est confidentiel dans le respect du code de déontologie du psychologue.";
}

/** Schéma.org : type principal pour le script JSON-LD du layout. */
export function professionMainEntityJsonLdType(
  profession: ClientProfession,
): "Psychologist" | "Person" {
  return profession === "psychomotricien" ? "Person" : "Psychologist";
}

export function professionSupportsMonSoutienPsy(profession: ClientProfession): boolean {
  return profession === "psychologue";
}
