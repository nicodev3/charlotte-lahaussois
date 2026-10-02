import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

/** Frontmatter commun aux pages Markdown (articles, pages pratique). */
const markdownPageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  draft: z.boolean().default(false),
  updatedAt: z.string().optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: markdownPageSchema,
});

const practicePages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/practice-pages" }),
  schema: markdownPageSchema,
});

const siteCopy = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/site-copy" }),
  schema: z.object({
    chapo: z.string().optional(),
    introduction: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          price: z.number().min(0),
          durationMinutes: z.number().int().min(20).max(180).default(60),
          note: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = { pages, practicePages, siteCopy };
