import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const IGNORED_DIRS = new Set([".git", "node_modules", "dist", ".astro", ".vscode"]);
const SCANNED_EXTENSIONS = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ps1",
  ".ts",
  ".tsx",
  ".toml",
  ".xml",
  ".yml",
  ".yaml",
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        files.push(...(await walk(fullPath)));
      }
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SCANNED_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function hasUtf8Bom(filePath) {
  const buf = await readFile(filePath);
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

async function main() {
  const files = await walk(ROOT);
  const offenders = [];

  for (const file of files) {
    if (await hasUtf8Bom(file)) {
      offenders.push(path.relative(ROOT, file));
    }
  }

  if (offenders.length > 0) {
    console.error("[check:bom] UTF-8 BOM detected in:");
    for (const file of offenders) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  console.log("[check:bom] OK - no UTF-8 BOM found.");
}

main().catch((error) => {
  console.error("[check:bom] Unexpected error");
  console.error(error);
  process.exit(1);
});
