import type { SiteNavLink } from "./astroPageNavigation";

export type FooterSiteMapItem = { label: string; href: string };

const LEGAL_PATH = "/mentions-legales";

function pathKey(href: string): string {
  return href.split("#")[0]!.replace(/\/+$/, "") || "/";
}

/** Plan du site pied de page : pages publiques uniquement (mentions légales exclues, doublons dédupliqués). */
export function buildFooterSiteMapItems(params: {
  mainNavItems: SiteNavLink[];
  practiceNavItems: SiteNavLink[];
  publishedArticles: FooterSiteMapItem[];
}): FooterSiteMapItem[] {
  const seen = new Set<string>();
  const out: FooterSiteMapItem[] = [];

  const push = (item: FooterSiteMapItem) => {
    const key = pathKey(item.href);
    if (key === LEGAL_PATH || seen.has(key)) return;
    seen.add(key);
    out.push(item);
  };

  push({ label: "Accueil", href: "/" });
  for (const item of [...params.mainNavItems, ...params.practiceNavItems]) {
    push({ href: item.href, label: item.label });
  }

  if (params.publishedArticles.length > 0) {
    push({ label: "Articles", href: "/articles/" });
    for (const article of params.publishedArticles) push(article);
  }

  return out;
}
