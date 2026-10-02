import type { ClientConfig } from "./client/schema";
import type { SiteNavLink } from "./astroPageNavigation";
import { REGISTERED_PRACTICE_PAGES, practicePageHref } from "./practicePageRegistry";

/** Pages pratique activées et affichables dans le menu, triées (ordre puis libellé). */
export function getEnabledPracticePageNavItems(client: ClientConfig): SiteNavLink[] {
  return REGISTERED_PRACTICE_PAGES.filter(
    (t) => client.practicePageEnabled[t.id] === true && t.includeInMainNav,
  )
    .map((t) => ({
      href: practicePageHref(t.slug),
      label: t.navLabel,
      order: t.navOrder,
    }))
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "fr"));
}
