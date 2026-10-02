// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import client from "./src/data/client.json" with { type: "json" };
import { siteFonts } from "./src/design/fonts.mjs";

/** Pages techniques, jamais indexées (sitemap + robots.txt). */
export const NON_INDEXABLE_PATHS = ["/admin/", "/client-config/"];

// https://astro.build/config
export default defineConfig({
  site: client.seo.baseUrl,
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !NON_INDEXABLE_PATHS.some((path) => page.includes(path)),
    }),
  ],
  env: {
    schema: {
      /** Clé Web3Forms du site intake (`/client-config/`). Absente → pas de bouton d’envoi. */
      PUBLIC_WEB3FORMS_ACCESS_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      /** `true` sur les sites démo / préprod / intake : meta robots noindex + robots.txt Disallow. */
      PUBLIC_NOINDEX: envField.boolean({ context: "client", access: "public", default: false }),
      /** Dépôt GitHub `owner/repo` pour Decap (prioritaire sur `src/data/cms.json` et le remote origin). */
      PUBLIC_GITHUB_REPO: envField.string({ context: "server", access: "public", optional: true }),
      /** Branche suivie par Decap (défaut : `cms.json` puis `main`). */
      PUBLIC_GITHUB_BRANCH: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      /** Proxy OAuth partagé pour Decap (sans slash final). Vide → Pages Functions `/api/auth` du site. */
      PUBLIC_DECAP_OAUTH_BASE_URL: envField.string({
        context: "server",
        access: "public",
        optional: true,
        url: true,
      }),
    },
  },
  fonts: siteFonts,
  vite: {
    plugins: [tailwindcss()],
  },
});
