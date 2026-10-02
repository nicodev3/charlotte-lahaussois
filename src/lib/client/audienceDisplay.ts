/** Ordre d’affichage et libellés du public accompagné (`practice.audience`). */
export const AUDIENCE_ORDER = [
  "enfants",
  "adolescents",
  "adultes",
  "couples",
  "familles",
  "autre",
] as const;

export type AudienceId = (typeof AUDIENCE_ORDER)[number];

export const AUDIENCE_LABEL: Record<AudienceId, string> = {
  enfants: "Enfants",
  adolescents: "Adolescents",
  adultes: "Adultes",
  couples: "Couples",
  familles: "Familles",
  autre: "Autres publics",
};

/** Libellés courts (hero, phrases). */
export const AUDIENCE_LABEL_SHORT: Record<AudienceId, string> = {
  enfants: "enfants",
  adolescents: "adolescents",
  adultes: "adultes",
  couples: "couples",
  familles: "familles",
  autre: "",
};

export function audienceDisplayLabels(
  audience: readonly AudienceId[],
  audienceOther: string,
): string[] {
  const detail = audienceOther.trim();
  const set = new Set(audience);
  const out: string[] = [];
  for (const id of AUDIENCE_ORDER) {
    if (!set.has(id)) continue;
    if (id === "autre") {
      out.push(detail.length > 0 ? detail : AUDIENCE_LABEL.autre);
    } else {
      out.push(AUDIENCE_LABEL[id]);
    }
  }
  return out.filter((item, index, arr) => item.length > 0 && arr.indexOf(item) === index);
}
