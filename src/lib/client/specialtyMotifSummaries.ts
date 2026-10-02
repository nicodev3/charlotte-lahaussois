import { SPECIALTY_MOTIF_ORDERED_LABELS } from "./specialtyMotifSections.ts";

/** Motifs saisis hors liste (textarea « Autres ») : texte générique affiché sur l’accueil. */
export const FALLBACK_CUSTOM_SPECIALTY_SUMMARY =
  "Un accompagnement adapté à votre demande autour de ce motif, à votre rythme et dans un cadre bienveillant.";

/**
 * Un résumé court (≤ 2 phrases) par libellé prédéfini du formulaire.
 * Les clés doivent correspondre exactement à celles de `specialtyMotifSections.ts`.
 */
const SPECIALTY_SUMMARIES_RAW: Record<string, string> = {
  "TSA, retard de développement et mutisme sélectif":
    "Comprendre les besoins liés au neurodéveloppement et renforcer les stratégies d’autorégulation au quotidien. Nous travaillons en lien avec l’entourage quand c’est utile, sans imposer un rythme qui surcharge.",
  "TDA/H et troubles des apprentissages et du langage":
    "Mieux organiser l’attention, l’impulsivité et les modes de fonctionnement scolaires ou professionnels. Nous ciblons aussi le rapport aux lectures, écrits et échanges lorsque le langage ou l’apprentissage demande un effort constant.",
  "Troubles anxieux et phobiques":
    "Identifier les déclencheurs, apaiser l’hypervigilance et réduire les évitements (dont séparations, phobies, panique ou situations scolaires). Des outils concrets vous aident à retrouver de la souplesse dans les situations du quotidien.",
  TOC: "Distancier les pensées intrusives et les rituels sans alimenter la lutte permanente qui les renforce. Vous expérimentez des réponses alternatives et une tolérance progressive à l’inconfort.",
  "ESPT et adaptation au stress après événement traumatique":
    "Stabiliser les réactivations, les souvenirs intrusifs et l’hypervigilance dans un cadre sécurisant. Nous intégrons la régulation avant d’aborder le récit lorsque vous y êtes prêt.",
  "Deuil, violences, harcèlement et troubles relationnels sévères":
    "Donner sens à ce qui a brisé les repères (deuil, violences, harcèlement, ruptures ou troubles de l’attachement) sans rester seul avec la honte ou la colère. Le travail vise la sécurisation du présent et des appuis réalistes, y compris avec les institutions concernées.",
  "Troubles dépressifs et dysthymie":
    "Sortir de la spirale rumination et d’anhédonie par des micro-actions réalistes et des exigences ajustées. Si des idées suicidaires apparaissent, mettons en sécurité le présent : en urgence absolue, contactez le 15 ou le 112 ; le cabinet ne remplace pas les urgences.",
  "Trouble bipolaire":
    "Mieux repérer les phases, les signaux précoces et les facteurs de vulnérabilité autour des variations d’humeur. L’accompagnement complète le suivi médical en renforçant la stabilité du quotidien et l’adhésion aux soins.",
  "Schizophrénie, trouble délirant et troubles dissociatifs":
    "Soutenir le quotidien, réduire l’isolement et sécuriser le lien aux soins lorsque la réalité perçue est fluctuante. Pour les troubles dissociatifs, des techniques d’ancrage aident à retrouver une continuité de présence plus stable.",
  "Anorexie, boulimie et troubles hyperphagiques":
    "Travailler la relation au corps, à la nourriture et aux cycles restriction—pulsion sans réduire la problématique au seul poids. Le suivi complète souvent une prise en charge globale avec le médecin ou la nutrition.",
  "Automutilation non suicidaire":
    "Comprendre la souffrance que les gestes expriment et développer des substituts moins dangereux tout en stabilisant les contextes à risque. La priorité est la sécurisation ; le sens du geste se construit ensuite, sans jugement.",
  "Addictions (substances, jeux, écrans…)":
    "Repérer les déclencheurs, les croyances et les environnements qui maintiennent l’usage malgré les conséquences. Vous explorez d’autres façons de réguler la tension, l’ennui ou la recherche de récompense.",
  "Troubles du sommeil":
    "Réaligner les routines et l’anxiété de performance du sommeil sans entrer dans une spirale de contrôle impossible. Des principes simples d’hygiène et de relaxation structurent des nuits moins conflictuelles.",
  "Symptômes somatiques persistants et douleur chronique":
    "Donner sens au mal-être corporel quand les examens ne suffisent pas à tout expliquer. Nous travaillons la fatigue, la peur du mouvement et la douleur chronique avec des stratégies de vie progressive, sans minimiser la souffrance.",
  "Difficultés relationnelles, familiales et isolement social":
    "Clarifier attentes, limites et besoins dans la sphère familiale ou amicale et réduire l’isolement par des micro-liens réalistes. On vise des propos et des gestes soutenables plutôt qu’une « vie sociale idéale » immédiate.",
  "Souffrance au travail, épuisement professionnel et reconversion":
    "Faire le point sur l’épuisement, les déséquilibres de charge et le sens du travail sans culpabiliser la mise en pause. Vous structurez des limites, des décisions réalistes ou un projet de transition avec des pas concrets.",
  "Questionnement identitaire, estime de soi et orientation":
    "Explorer en sécurité le genre, la sexualité, l’image de soi ou les choix d’orientation sans précipitation ni autocensure. Le travail renforce des critères progressifs, la confiance en l’action et des repères qui vous ressemblent.",
};

for (const label of SPECIALTY_MOTIF_ORDERED_LABELS) {
  const text = SPECIALTY_SUMMARIES_RAW[label];
  if (text == null || text.trim() === "") {
    throw new Error(
      `[specialtyMotifSummaries] Résumé manquant pour le libellé : ${JSON.stringify(label)}`,
    );
  }
}

const builtSummaries: Record<string, string> = Object.fromEntries(
  SPECIALTY_MOTIF_ORDERED_LABELS.map((label) => [label, SPECIALTY_SUMMARIES_RAW[label]!]),
);

export const SPECIALTY_MOTIF_SUMMARIES: Readonly<Record<string, string>> = builtSummaries;

export function getSpecialtyMotifSummary(label: string): string {
  const key = label.trim();
  if (Object.prototype.hasOwnProperty.call(SPECIALTY_MOTIF_SUMMARIES, key)) {
    return SPECIALTY_MOTIF_SUMMARIES[key]!;
  }
  return FALLBACK_CUSTOM_SPECIALTY_SUMMARY;
}
