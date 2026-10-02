import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ZodError } from "zod";

import { FORMSPREE_FORM_ID } from "../src/lib/constants.ts";
import { ClientMigrationError, parseClientConfig } from "../src/lib/client/migrations.ts";
import {
  REGISTERED_PRACTICE_PAGES,
  practicePageContentId,
} from "../src/lib/practicePageRegistry.ts";

const PRACTICE_PAGES_DIR = new URL("../src/content/practice-pages/", import.meta.url);

function resolveClientJsonUrl() {
  const env = process.env.CLIENT_JSON_PATH?.trim();
  const arg = process.argv[2]?.trim();
  const raw = arg || env;
  if (!raw) {
    return new URL("../src/data/client.json", import.meta.url);
  }
  const abs = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
  return pathToFileURL(abs);
}

const CLIENT_JSON_URL = resolveClientJsonUrl();
const CLIENT_JSON_LABEL = fileURLToPath(CLIENT_JSON_URL);

async function main() {
  const raw = await readFile(CLIENT_JSON_URL, "utf8");
  const jsonText = raw.replace(/^\uFEFF/, "");

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    console.error(`[validate:client] Syntaxe JSON invalide dans ${CLIENT_JSON_LABEL}`);
    console.error(String(error));
    process.exit(1);
  }

  let config;
  try {
    config = parseClientConfig(parsed);
  } catch (error) {
    if (error instanceof ClientMigrationError) {
      console.error(`[validate:client] Migration impossible pour ${CLIENT_JSON_LABEL}`);
      console.error(`- ${error.message}`);
      process.exit(1);
    }

    if (error instanceof ZodError) {
      console.error(`[validate:client] Validation schéma échouée pour ${CLIENT_JSON_LABEL}`);
      for (const issue of error.issues) {
        const pathStr = issue.path.length > 0 ? issue.path.join(".") : "root";
        console.error(`- ${pathStr}: ${issue.message}`);
      }
      process.exit(1);
    }

    throw error;
  }

  if (config.contact.channels.selected.includes("form") && FORMSPREE_FORM_ID.trim().length === 0) {
    console.error(
      "[validate:client] contact.channels.selected contient « form » mais FORMSPREE_FORM_ID est vide — renseignez src/lib/constants.ts.",
    );
    process.exit(1);
  }

  for (const page of REGISTERED_PRACTICE_PAGES) {
    if (!config.practicePageEnabled[page.id]) continue;
    const fileUrl = new URL(practicePageContentId(page.slug), PRACTICE_PAGES_DIR);
    try {
      await access(fileUrl);
    } catch {
      console.error(
        `[validate:client] practicePageEnabled.${page.id} est true mais le fichier Markdown est absent : src/content/practice-pages/${practicePageContentId(page.slug)}`,
      );
      process.exit(1);
    }
  }

  console.log(`[validate:client] OK — ${CLIENT_JSON_LABEL}`);
}

main().catch((error) => {
  console.error("[validate:client] Erreur inattendue");
  console.error(error);
  process.exit(1);
});
