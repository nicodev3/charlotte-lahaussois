import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { ZodError } from "zod";

import { ClientMigrationError, parseClientConfig } from "../src/lib/client/migrations.ts";

const targetPath = path.resolve(process.cwd(), "src/data/client.json");
const inputArg = process.argv[2]?.trim();

function printIssues(error) {
  if (error instanceof ClientMigrationError) {
    console.error(`[import:client] Migration impossible: ${error.message}`);
    return;
  }

  if (error instanceof ZodError) {
    console.error("[import:client] Le JSON ne respecte pas le contrat de contenu:");
    for (const issue of error.issues) {
      const pathStr = issue.path.length > 0 ? issue.path.join(".") : "root";
      console.error(`- ${pathStr}: ${issue.message}`);
    }
    return;
  }

  console.error(error);
}

async function main() {
  if (!inputArg) {
    console.error("[import:client] Usage: npm run import:client -- path/to/form-output.json");
    process.exit(1);
  }

  const inputPath = path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(inputPath, "utf8"));
  } catch (error) {
    console.error(`[import:client] Impossible de lire ou parser ${inputPath}`);
    console.error(String(error));
    process.exit(1);
  }

  let config;
  try {
    config = parseClientConfig(parsed);
  } catch (error) {
    printIssues(error);
    process.exit(1);
  }

  await writeFile(targetPath, `${JSON.stringify(config, null, 4)}\n`, "utf8");
  console.log(`[import:client] OK - ${inputPath} -> ${targetPath}`);
}

main().catch((error) => {
  console.error("[import:client] Erreur inattendue");
  console.error(error);
  process.exit(1);
});
