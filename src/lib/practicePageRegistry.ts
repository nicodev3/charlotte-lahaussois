/**
 * Registre fermé des pages pratique (approches / thérapies activables).
 * Chaque entrée : id = clé dans client.practicePageEnabled, slug = segment d’URL.
 * Fichier Markdown attendu : src/content/practice-pages/{slug}.md
 */

/** Slugs déjà réservés par des routes Astro statiques ou dossiers. */
export const RESERVED_PRACTICE_PAGE_SLUGS = new Set([
  "articles",
  "contact",
  "dev",
  "index",
  "mentions-legales",
  "a-propos",
  "tarifs",
]);

export const REGISTERED_PRACTICE_PAGES = [
  {
    id: "tcc",
    slug: "therapies-tcc",
    navLabel: "Thérapies TCC",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "act",
    slug: "therapie-act",
    navLabel: "Thérapie ACT",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "schemaTherapy",
    slug: "therapie-des-schemas",
    navLabel: "Thérapie des schémas",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "dbt",
    slug: "therapie-dialectique-dbt",
    navLabel: "Thérapie DBT",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "mbct",
    slug: "mbct",
    navLabel: "MBCT",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "rebt",
    slug: "therapie-rationnelle-emotive",
    navLabel: "Thérapie rationnelle émotive (REBT)",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "exposureTherapy",
    slug: "therapie-exposition",
    navLabel: "Thérapie par exposition",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "psychodynamic",
    slug: "psychotherapie-psychodynamique",
    navLabel: "Psychothérapie psychodynamique",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "psychoanalytic",
    slug: "psychanalyse",
    navLabel: "Psychanalyse",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "personCentered",
    slug: "approche-centree-sur-la-personne",
    navLabel: "Approche centrée sur la personne",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "gestalt",
    slug: "gestalt-therapie",
    navLabel: "Gestalt-thérapie",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "existential",
    slug: "therapie-existentielle",
    navLabel: "Thérapie existentielle",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "systemicFamily",
    slug: "therapie-systemique",
    navLabel: "Thérapie systémique",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "coupleTherapy",
    slug: "therapie-de-couple",
    navLabel: "Thérapie de couple",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "briefTherapy",
    slug: "therapie-breve",
    navLabel: "Thérapie brève",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "solutionFocused",
    slug: "therapie-solutions",
    navLabel: "Thérapie centrée sur les solutions",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "narrativeTherapy",
    slug: "therapie-narrative",
    navLabel: "Thérapie narrative",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "strategicTherapy",
    slug: "therapie-strategique",
    navLabel: "Thérapie stratégique",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "integrative",
    slug: "approche-integrative",
    navLabel: "Approche intégrative",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "ipt",
    slug: "therapie-interpersonnelle",
    navLabel: "Thérapie interpersonnelle (TIP)",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "eft",
    slug: "therapie-focalisee-emotions",
    navLabel: "Thérapie focalisée sur les émotions (EFT)",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "emdr",
    slug: "emdr",
    navLabel: "EMDR",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "clinicalHypnosis",
    slug: "hypnotherapie",
    navLabel: "Hypnothérapie",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "mindfulnessMbsr",
    slug: "pleine-conscience-mbsr",
    navLabel: "Pleine conscience (MBSR)",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "sexTherapy",
    slug: "therapie-sexuelle",
    navLabel: "Thérapie sexuelle",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "playTherapy",
    slug: "therapie-par-le-jeu",
    navLabel: "Thérapie par le jeu",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "artTherapy",
    slug: "art-therapie",
    navLabel: "Art-thérapie",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "clayField",
    slug: "champ-d-argile",
    navLabel: "Champ d'argile",
    navOrder: 32,
    includeInMainNav: true,
  },
  {
    id: "motivationalInterviewing",
    slug: "entretien-motivationnel",
    navLabel: "Entretien motivationnel",
    navOrder: 32,
    includeInMainNav: true,
  },
] as const;

export type RegisteredPracticePage = (typeof REGISTERED_PRACTICE_PAGES)[number];
export type PracticePageId = RegisteredPracticePage["id"];

export function practicePageContentId(slug: string): string {
  return `${slug}.md`;
}

/** Correspondance entrée collection ↔ fichier attendu (id loader = chemin, basename, avec ou sans extension). */
export function practicePageEntryMatchesContentId(entryId: string, contentId: string): boolean {
  const normalized = entryId.replace(/\\/g, "/");
  const slug = contentId.replace(/\.mdx?$/i, "");
  return (
    normalized === contentId ||
    normalized.endsWith(`/${contentId}`) ||
    normalized === slug ||
    normalized.endsWith(`/${slug}`)
  );
}

export function practicePageHref(slug: string): string {
  return `/${slug}/`;
}

function assertNoReservedSlugs(): void {
  for (const t of REGISTERED_PRACTICE_PAGES) {
    if (RESERVED_PRACTICE_PAGE_SLUGS.has(t.slug)) {
      throw new Error(`practice page slug "${t.slug}" is reserved (page id: ${t.id})`);
    }
  }
}

assertNoReservedSlugs();
