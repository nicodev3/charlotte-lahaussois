import { getCollection } from "astro:content";
import { getPageHref, getPageSlug } from "./pageRoutes";

type Publishable = { data: { draft: boolean } };

/** Filtre de collection : brouillons visibles en dev, exclus en build de production. */
export function isPublishedEntry({ data }: Publishable): boolean {
  return import.meta.env.DEV || !data.draft;
}

export type ArticleNavItem = {
  slug: string;
  href: string;
  title: string;
  description?: string;
  updatedAt: string;
};

export type GetArticleNavigationOptions = {
  /** Inclure les brouillons. Par défaut : oui en dev, non en build de production. */
  includeDrafts?: boolean;
};

/** Articles triés : date de mise à jour décroissante, puis titre. */
export async function getArticleNavigation(
  options: GetArticleNavigationOptions = {},
): Promise<ArticleNavItem[]> {
  const includeDrafts = options.includeDrafts ?? import.meta.env.DEV;
  const pages = await getCollection("pages", ({ data }) => includeDrafts || !data.draft);

  return pages
    .map((entry) => {
      const slug = getPageSlug(entry.id);
      return {
        slug,
        href: getPageHref(slug),
        title: entry.data.title,
        description: entry.data.description,
        updatedAt: entry.data.updatedAt ?? "",
      };
    })
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt, "fr") || a.title.localeCompare(b.title, "fr"),
    );
}
