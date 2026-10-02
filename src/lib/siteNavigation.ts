import { client } from "./client";
import { getAstroMainPages, type SiteNavLink } from "./astroPageNavigation";
import { getEnabledPracticePageNavItems } from "./practicePagesNav";

export type SiteNavigation = {
  /** Pages Astro exportant `pageNav`, triées par `navOrder` (Contact en dernier par convention). */
  main: SiteNavLink[];
  /** Pages pratique activées (menu « Mes pratiques »), triées. */
  practices: SiteNavLink[];
};

/** Navigation partagée par le header et le pied de page. */
export async function getSiteNavigation(): Promise<SiteNavigation> {
  return {
    main: await getAstroMainPages(),
    practices: getEnabledPracticePageNavItems(client),
  };
}
