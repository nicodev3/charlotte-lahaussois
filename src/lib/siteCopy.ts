import { getCollection, type CollectionEntry } from "astro:content";

export const SITE_COPY_SLUGS = ["accueil", "tarifs"] as const;

export type SiteCopySlug = (typeof SITE_COPY_SLUGS)[number];

function entrySlug(id: string): string {
  const normalized = id.replace(/\\/g, "/").replace(/\.mdx?$/i, "");
  return normalized.split("/").pop() ?? normalized;
}

export async function getSiteCopy(slug: SiteCopySlug): Promise<CollectionEntry<"siteCopy">> {
  const entries = await getCollection("siteCopy");
  const entry = entries.find((item) => entrySlug(item.id) === slug);
  if (!entry) {
    throw new Error(`[siteCopy] Fichier manquant : src/content/site-copy/${slug}.md`);
  }
  return entry;
}
