export function getPageSlug(entryId: string) {
  return entryId.replace(/\.md$/, "");
}

export function getPageHref(slug: string) {
  return `/articles/${slug}/`;
}
