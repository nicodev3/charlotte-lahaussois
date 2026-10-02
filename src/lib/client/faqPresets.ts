/**
 * Catalogue fermé des entrées FAQ : contenu en dur du template (affichage + JSON-LD),
 * non éditable via le CMS ni via client.json. Seule la réponse « remboursement » varie selon le métier.
 */

import type { ClientProfession } from "./profession.ts";

export type FaqCustomEntry = { question: string; answer: string };

export const FAQ_PRESETS = [
  {
    id: "rdvBooking",
    question: "Comment prendre rendez-vous ?",
    answer:
      "Vous pouvez réserver en ligne à tout moment via Doctolib. Si vous préférez, un premier contact par e-mail permet de préciser votre besoin avant la première séance.",
  },
  {
    id: "firstSession",
    question: "Comment se passe la première séance ?",
    answer:
      "La première séance sert à comprendre votre situation, vos attentes et vos priorités. Nous clarifions ensemble le cadre, le rythme et les objectifs du suivi pour démarrer sur des bases solides.",
  },
  {
    id: "visioSessions",
    question: "Les consultations en visio sont-elles possibles ?",
    answer:
      "Oui, les consultations en visio sont possibles et suivent le même cadre que les séances au cabinet. Elles conviennent particulièrement si vous avez des contraintes de déplacement ou d’emploi du temps.",
  },
  {
    id: "sessionPricing",
    question: "Quel est le tarif d’une séance ?",
    answer:
      "Les tarifs sont indiqués sur la page Tarifs avec la durée des séances. Une facture peut être remise à la fin de chaque consultation pour vos démarches administratives.",
  },
  {
    id: "reimbursement",
    question: "Les séances sont-elles remboursées ?",
    answer:
      "Les consultations psychologiques ne sont généralement pas remboursées par la Sécurité sociale hors dispositifs spécifiques. En revanche, de nombreuses mutuelles proposent une prise en charge partielle.",
  },
] as const;

export type FaqPresetId = (typeof FAQ_PRESETS)[number]["id"];

const FAQ_REIMBURSEMENT_ANSWER: Record<ClientProfession, string> = {
  psychologue:
    "Les consultations psychologiques ne sont généralement pas remboursées par la Sécurité sociale hors dispositifs spécifiques. En revanche, de nombreuses mutuelles proposent une prise en charge partielle.",
  psychomotricien:
    "Le remboursement des séances de psychomotricité dépend de la situation (prescription, conventionnement, mutuelle, public concerné). Les modalités diffèrent souvent des actes de psychologie ; renseignez-vous auprès de votre caisse et de votre mutuelle.",
};

function faqPresetAnswerForProfession(
  preset: (typeof FAQ_PRESETS)[number],
  profession: ClientProfession,
): string {
  if (preset.id === "reimbursement") {
    return FAQ_REIMBURSEMENT_ANSWER[profession];
  }
  return preset.answer;
}

export type FaqResolvedItem = {
  id: string;
  question: string;
  answer: string;
};

function normalizeFaqQuestion(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ");
}

export function matchFaqPresetByQuestion(
  question: string,
): (typeof FAQ_PRESETS)[number] | undefined {
  const n = normalizeFaqQuestion(question);
  return FAQ_PRESETS.find((p) => normalizeFaqQuestion(p.question) === n);
}

export function defaultFaqItems(): Record<FaqPresetId, boolean> {
  return Object.fromEntries(FAQ_PRESETS.map((p) => [p.id, false])) as Record<FaqPresetId, boolean>;
}

/** Entrées personnalisées non vides (filtrage pour validation / affichage). */
export function normalizeFaqCustomItems(val: unknown): FaqCustomEntry[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((x) => x && typeof x === "object" && !Array.isArray(x))
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        question: String(o.question ?? "").trim(),
        answer: String(o.answer ?? "").trim(),
      };
    })
    .filter((x) => x.question.length > 0 && x.answer.length > 0);
}

/** Contenu FAQ affiché sur le site : l’intégralité du catalogue, en dur (pas de sélection client). */
export function resolvedFaqEntries(profession: ClientProfession): FaqResolvedItem[] {
  return FAQ_PRESETS.map((p) => ({
    id: p.id,
    question: p.question,
    answer: faqPresetAnswerForProfession(p, profession),
  }));
}
