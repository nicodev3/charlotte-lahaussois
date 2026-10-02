import { promises as fs } from "node:fs";
import path from "node:path";

function printUsage() {
  console.log("Usage: npm run delete:page -- --slug <slug>");
  console.log("Example: npm run delete:page -- --slug test");
}

function getArg(name) {
  const key = `--${name}`;
  const index = process.argv.indexOf(key);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] ?? null;
}

function normalizeSlug(rawSlug) {
  if (!rawSlug) {
    return "";
  }
  return rawSlug.trim().replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.md$/, "");
}

async function deleteContentPage(slug) {
  const projectRoot = process.cwd();
  const pagesDir = path.join(projectRoot, "src", "content", "pages");
  const pagePath = path.join(pagesDir, `${slug}.md`);

  await fs.unlink(pagePath);
  return pagePath;
}

async function main() {
  const help = process.argv.includes("--help") || process.argv.includes("-h");
  if (help) {
    printUsage();
    process.exit(0);
  }

  const slug = normalizeSlug(getArg("slug"));
  if (!slug) {
    printUsage();
    process.exit(1);
  }

  try {
    const deletedPath = await deleteContentPage(slug);
    console.log(`Page deleted: ${deletedPath}`);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      console.error(`Page not found for slug: ${slug}`);
      process.exit(1);
    }

    console.error("Failed to delete page:", error);
    process.exit(1);
  }
}

await main();
