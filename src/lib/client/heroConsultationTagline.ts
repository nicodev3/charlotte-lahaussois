import type { ClientConfig } from "./schema.ts";
import { AUDIENCE_LABEL_SHORT, AUDIENCE_ORDER } from "./audienceDisplay.ts";
import { formatConsultationModesPhrase } from "./consultationModesDisplay.ts";

export function formatFrenchList(items: string[]): string {
  const filtered = items.map((s) => s.trim()).filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0]!;
  if (filtered.length === 2) return `${filtered[0]} et ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(", ")} et ${filtered[filtered.length - 1]}`;
}

/**
 * Partie du sous-titre hero après le préfixe métier (« Consultations de psychologie pour », etc.),
 * incluant le point final (publics + modes de consultation).
 */
export function heroConsultationTaglineAfterPour(practice: ClientConfig["practice"]): string {
  const audienceSet = new Set(practice.audience);
  const segments: string[] = [];
  for (const id of AUDIENCE_ORDER) {
    if (!audienceSet.has(id)) continue;
    if (id === "autre") {
      const detail = practice.audienceOther.trim();
      if (detail) segments.push(detail);
    } else {
      segments.push(AUDIENCE_LABEL_SHORT[id]);
    }
  }

  let audiencePart = formatFrenchList(segments);
  if (!audiencePart) {
    audiencePart = "adultes";
  }

  const modesPart = formatConsultationModesPhrase(practice.consultationModes);
  const tail = modesPart ? `${audiencePart}, ${modesPart}` : audiencePart;
  return `${tail}.`;
}
