export type SiteNavLink = { href: string; label: string; order: number };

/** Métadonnées de menu exportées par une page Astro (`export const pageNav = {...}`). */
export type AstroPageNavMeta = {
  navLabel?: string;
  navOrder?: number;
  includeInMainNav?: boolean;
};

type AstroPageModule = {
  pageNav?: AstroPageNavMeta;
};

const CONTACT_HREF = "/contact/";

/** Sépare le lien Contact pour le placer après d’autres blocs (ex. menu « Mes pratiques »). */
export function splitContactNavItem<T extends { href: string }>(
  items: T[],
): { primary: T[]; contact: T | null } {
  const contact = items.find((item) => item.href === CONTACT_HREF) ?? null;
  return { primary: items.filter((item) => item !== contact), contact };
}

/**
 * Pages Astro de premier niveau qui exportent `pageNav`, triées (ordre puis libellé).
 * index.astro est exclu du glob : un chargement eager de l’accueil pendant son évaluation
 * (Header → ce module → index) laisserait BaseLayout indéfini au rendu.
 */
export async function getAstroMainPages(): Promise<SiteNavLink[]> {
  const pageModules = import.meta.glob(["../pages/*.astro", "!../pages/index.astro"], {
    eager: true,
  }) as Record<string, AstroPageModule>;

  const items = Object.entries(pageModules).flatMap(([path, mod]) => {
    const fileName = path.split("/").at(-1) ?? "";
    const meta = mod.pageNav;
    if (fileName.startsWith("[") || !meta || meta.includeInMainNav === false) return [];

    const slug = fileName.replace(/\.astro$/, "");
    return [
      {
        href: `/${slug}/`,
        label: meta.navLabel ?? slug,
        order: meta.navOrder ?? Number.MAX_SAFE_INTEGER,
      },
    ];
  });

  return items.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "fr"));
}
