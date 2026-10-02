import type { APIRoute } from "astro";
import { PUBLIC_NOINDEX } from "astro:env/client";
import { NON_INDEXABLE_PATHS } from "../../astro.config.mjs";

export const GET: APIRoute = ({ site }) => {
  const lines = PUBLIC_NOINDEX
    ? ["User-agent: *", "Disallow: /"]
    : [
        "User-agent: *",
        ...NON_INDEXABLE_PATHS.map((path) => `Disallow: ${path}`),
        `Sitemap: ${new URL("sitemap-index.xml", site)}`,
      ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
