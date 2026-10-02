/** Ordre d’affichage des modes de consultation. */
export const CONSULTATION_MODE_ORDER = ["cabinet", "visio", "domicile"] as const;

export type ConsultationModeId = (typeof CONSULTATION_MODE_ORDER)[number];

export const CONSULTATION_MODE_CHIP_LABEL: Record<ConsultationModeId, string> = {
  cabinet: "Cabinet",
  visio: "Visio",
  domicile: "Domicile",
};

/** Phrase pour le sous-titre hero (après le public). */
export function formatConsultationModesPhrase(modes: readonly string[]): string {
  const cabinet = modes.includes("cabinet");
  const visio = modes.includes("visio");
  const domicile = modes.includes("domicile");
  const parts: string[] = [];
  if (cabinet) parts.push("au cabinet");
  if (visio) parts.push("en visio");
  if (domicile) parts.push("à domicile");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} et ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} et ${parts[2]}`;
}
