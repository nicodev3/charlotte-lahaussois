import { client } from "../client.ts";
import { REGISTERED_PRACTICE_PAGES, practicePageContentId } from "../practicePageRegistry.ts";
import { isGithubRepoConfigured, resolveGithubBranch, resolveGithubRepo } from "./githubRepo.ts";

type DecapField = Record<string, unknown>;

const articleFields: DecapField[] = [
  { label: "Titre", name: "title", widget: "string" },
  { label: "Description", name: "description", widget: "text", required: false },
  { label: "Brouillon", name: "draft", widget: "boolean", default: true },
  {
    label: "Date de mise à jour",
    name: "updatedAt",
    widget: "datetime",
    date_format: "YYYY-MM-DD",
    time_format: false,
    format: "YYYY-MM-DD",
    required: false,
  },
  { label: "Contenu", name: "body", widget: "markdown" },
];

/**
 * Médias dans `src/assets/uploads`, référencés en chemin relatif depuis les fichiers Markdown
 * (`../../assets/uploads/x.jpg`) pour qu’Astro les optimise au build (`astro:assets`).
 */
const CONTENT_MEDIA = {
  media_folder: "../../assets/uploads",
  public_folder: "../../assets/uploads",
} as const;

function enabledPracticePageFiles() {
  return REGISTERED_PRACTICE_PAGES.filter(
    (page) => client.practicePageEnabled[page.id] === true,
  ).map((page) => ({
    name: page.id,
    label: page.navLabel,
    file: `src/content/practice-pages/${practicePageContentId(page.slug)}`,
    ...CONTENT_MEDIA,
    fields: articleFields,
  }));
}

export function getDecapConfig() {
  const repo = resolveGithubRepo();
  const branch = resolveGithubBranch();
  const practicePageFiles = enabledPracticePageFiles();

  return {
    load_config_file: false,
    locale: "fr",
    local_backend: true,
    backend: {
      name: "github",
      repo,
      branch,
      auth_endpoint: "api/auth",
    },
    site_url: client.seo.baseUrl,
    display_url: client.seo.baseUrl,
    logo_url: "/favicon.svg",
    media_folder: "src/assets/uploads",
    public_folder: "/src/assets/uploads",
    commit_messages: {
      create: "CMS : création de {{collection}} « {{slug}} »",
      update: "CMS : mise à jour de {{collection}} « {{slug}} »",
      delete: "CMS : suppression de {{collection}} « {{slug}} »",
      uploadMedia: "CMS : ajout du média « {{path}} »",
      deleteMedia: "CMS : suppression du média « {{path}} »",
    },
    collections: [
      {
        name: "articles",
        label: "Articles",
        label_singular: "Article",
        folder: "src/content/pages",
        ...CONTENT_MEDIA,
        create: true,
        delete: true,
        slug: "{{slug}}",
        extension: "md",
        format: "frontmatter",
        identifier_field: "title",
        sortable_fields: ["title", "updatedAt"],
        editor: { preview: false },
        view_filters: [{ label: "Brouillons", field: "draft", pattern: true }],
        fields: articleFields,
      },
      {
        name: "site_copy",
        label: "Textes du client",
        editor: { preview: false },
        files: [
          {
            name: "accueil",
            label: "Accueil — chapô et introduction",
            file: "src/content/site-copy/accueil.md",
            fields: [
              { label: "Chapô", name: "chapo", widget: "text" },
              { label: "Introduction", name: "introduction", widget: "text" },
            ],
          },
          {
            name: "tarifs",
            label: "Tarifs et prestations",
            file: "src/content/site-copy/tarifs.md",
            fields: [
              {
                label: "Prestations",
                name: "items",
                widget: "list",
                summary: "{{name}} — {{price}} €",
                fields: [
                  { label: "Intitulé", name: "name", widget: "string" },
                  {
                    label: "Prix (€)",
                    name: "price",
                    widget: "number",
                    value_type: "float",
                    min: 0,
                  },
                  {
                    label: "Durée (minutes)",
                    name: "durationMinutes",
                    widget: "number",
                    value_type: "int",
                    min: 20,
                    max: 180,
                    default: 60,
                  },
                  { label: "Note", name: "note", widget: "string", required: false },
                ],
              },
            ],
          },
        ],
      },
      ...(practicePageFiles.length > 0
        ? [
            {
              name: "practice_pages",
              label: "Pages d’approches",
              editor: { preview: false },
              files: practicePageFiles,
            },
          ]
        : []),
    ],
  };
}

export function getDecapAdminMeta() {
  const repo = resolveGithubRepo();
  return {
    repo,
    branch: resolveGithubBranch(),
    repoConfigured: isGithubRepoConfigured(repo),
  };
}
