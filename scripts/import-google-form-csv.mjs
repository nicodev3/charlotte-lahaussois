import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { ZodError } from "zod";

import baseClient from "../src/data/client.json" with { type: "json" };
import formSchema from "../form-schema.json" with { type: "json" };
import { ClientMigrationError, parseClientConfig } from "../src/lib/client/migrations.ts";
import { REGISTERED_PRACTICE_PAGES } from "../src/lib/practicePageRegistry.ts";

const csvArg = process.argv[2]?.trim();
const rowArg = process.argv.find((arg) => arg.startsWith("--row="));
const targetPath = path.resolve(process.cwd(), "src/data/client.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function flattenFields(schema) {
  const fields = [];
  for (const section of schema.sections ?? []) {
    for (const field of section.fields ?? []) {
      fields.push(field);
    }
  }
  return fields;
}

const fieldIdByLabel = new Map(flattenFields(formSchema).map((field) => [field.label, field.id]));

/** Réponses Google Forms : libellé affiché → valeur technique (id client.json). */
const choiceAnswerByFieldId = new Map(
  flattenFields(formSchema)
    .filter((field) => Array.isArray(field.options))
    .map((field) => {
      const map = new Map();
      for (const option of field.options) {
        map.set(option.label, option.value);
        map.set(option.value, option.value);
      }
      if (field.id === "practicePageEnabledSelection") {
        for (const page of REGISTERED_PRACTICE_PAGES) {
          map.set(page.navLabel, page.id);
          map.set(page.id, page.id);
        }
      }
      return [field.id, map];
    }),
);

function normalizeChoiceAnswers(fieldId, raw) {
  const map = choiceAnswerByFieldId.get(fieldId);
  if (!map) return raw;

  const normalizeOne = (entry) => {
    const trimmed = entry.trim();
    return map.get(trimmed) ?? trimmed;
  };

  if (Array.isArray(raw)) return raw.map((entry) => normalizeOne(String(entry)));
  return normalizeOne(String(raw));
}

function headerToFieldId(header) {
  const trimmed = header.trim();
  if (trimmed.includes(" | ")) {
    return trimmed.split(" | ")[0]?.trim() || null;
  }
  return fieldIdByLabel.get(trimmed) ?? null;
}

function setAt(target, pathStr, value) {
  const parts = pathStr.split(".");
  let cur = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const shouldBeArray = /^\d+$/.test(nextKey);
    if (!cur[key] || typeof cur[key] !== "object") {
      cur[key] = shouldBeArray ? [] : {};
    }
    cur = cur[key];
  }
  cur[parts.at(-1)] = value;
}

function splitLines(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitMulti(value) {
  return value
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseBooleanish(value) {
  const v = value.trim().toLowerCase();
  return ["oui", "yes", "true", "1", "x", "checked"].includes(v);
}

function parseCredentialLines(value, kind) {
  return splitLines(value)
    .map((line) => {
      const [label = "", second = "", year = ""] = line.split("|").map((part) => part.trim());
      return kind === "training"
        ? { label, provider: second || undefined, year: year || undefined }
        : { label, institution: second || undefined, year: year || undefined };
    })
    .filter((entry) => entry.label);
}

function normalizeValue(fieldId, raw) {
  const value = raw.trim();
  if (value.length === 0) return undefined;

  if (
    fieldId === "practice.audience" ||
    fieldId === "practice.consultationModes" ||
    fieldId === "practicePageEnabledSelection" ||
    fieldId === "business.title" ||
    fieldId === "pricing.payment"
  ) {
    return normalizeChoiceAnswers(fieldId, splitMulti(value));
  }

  if (choiceAnswerByFieldId.has(fieldId)) {
    return normalizeChoiceAnswers(fieldId, value);
  }

  if (
    fieldId === "practice.specialties" ||
    fieldId === "practice.languages" ||
    fieldId === "credentials.affiliations" ||
    fieldId.startsWith("practiceOfferCustomApproaches.")
  ) {
    return splitLines(value);
  }

  if (fieldId === "credentials.degrees") return parseCredentialLines(value, "degree");
  if (fieldId === "credentials.trainings") return parseCredentialLines(value, "training");
  if (
    fieldId === "credentials.experienceYears" ||
    /^pricing\.items\.\d+\.(price|durationMinutes)$/.test(fieldId)
  ) {
    return Number(value.replace(",", "."));
  }
  if (fieldId.endsWith(".enabled")) return parseBooleanish(value);

  return value;
}

function applyPostProcessing(config) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  for (const day of days) {
    const slot = config.contact?.hours?.[day];
    if (!slot) continue;
    const value = typeof slot.value === "string" ? slot.value.trim() : "";
    slot.value = value;
    slot.enabled = value.length > 0;
  }

  if (Array.isArray(config.business?.title)) {
    const selectedTitles = config.business.title.filter((title) => title !== "Autre");
    const customTitle =
      typeof config.business.titleOther === "string" ? config.business.titleOther.trim() : "";
    config.business.title = customTitle || selectedTitles.join(", ");
  }
  if (config.business && "titleOther" in config.business) {
    delete config.business.titleOther;
  }

  if (Array.isArray(config.practicePageEnabledSelection)) {
    const selectedPages = new Set(config.practicePageEnabledSelection.slice(0, 6));
    config.practicePageEnabled = Object.fromEntries(
      REGISTERED_PRACTICE_PAGES.map((page) => [page.id, selectedPages.has(page.id)]),
    );
  }
  delete config.practicePageEnabledSelection;

  if (!config.seo?.ogImage && config.seo?.baseUrl) {
    config.seo.ogImage = `${String(config.seo.baseUrl).replace(/\/+$/, "")}/og.jpg`;
  }

  if (Array.isArray(config.pricing?.items)) {
    config.pricing.items = config.pricing.items
      .filter(
        (item) => item && typeof item === "object" && String(item.name ?? "").trim().length > 0,
      )
      .map((item) => ({
        ...item,
        name: String(item.name).trim(),
        price: Number(item.price),
        durationMinutes: Number(item.durationMinutes || 60),
        ...(item.note && String(item.note).trim() ? { note: String(item.note).trim() } : {}),
      }));
  }

  config.schemaVersion = 19;
}

function printIssues(error) {
  if (error instanceof ClientMigrationError) {
    console.error(`[import:google-form] Migration impossible: ${error.message}`);
    return;
  }
  if (error instanceof ZodError) {
    console.error("[import:google-form] Le contenu genere ne respecte pas le contrat:");
    for (const issue of error.issues) {
      const pathStr = issue.path.length > 0 ? issue.path.join(".") : "root";
      console.error(`- ${pathStr}: ${issue.message}`);
    }
    return;
  }
  console.error(error);
}

async function main() {
  if (!csvArg) {
    console.error(
      "[import:google-form] Usage: npm run import:google-form -- responses.csv [--row=last|1]",
    );
    process.exit(1);
  }

  const csvPath = path.isAbsolute(csvArg) ? csvArg : path.resolve(process.cwd(), csvArg);
  const rows = parseCsv(await readFile(csvPath, "utf8"));
  const [headers, ...dataRows] = rows;
  if (!headers || dataRows.length === 0) {
    console.error("[import:google-form] CSV vide ou sans reponse.");
    process.exit(1);
  }

  const rowSelector = rowArg?.slice("--row=".length) ?? "last";
  const rowIndex =
    rowSelector === "last" ? dataRows.length - 1 : Math.max(0, Number(rowSelector) - 1);
  const selected = dataRows[rowIndex];
  if (!selected) {
    console.error(`[import:google-form] Ligne introuvable: ${rowSelector}`);
    process.exit(1);
  }

  const config = structuredClone(baseClient);
  headers.forEach((header, index) => {
    const fieldId = headerToFieldId(header);
    if (!fieldId) return;
    const value = normalizeValue(fieldId, selected[index] ?? "");
    if (value === undefined) return;
    setAt(config, fieldId, value);
  });

  applyPostProcessing(config);

  let parsed;
  try {
    parsed = parseClientConfig(config);
  } catch (error) {
    printIssues(error);
    process.exit(1);
  }

  await writeFile(targetPath, `${JSON.stringify(parsed, null, 4)}\n`, "utf8");
  console.log(`[import:google-form] OK - ligne ${rowIndex + 1} de ${csvPath} -> ${targetPath}`);
}

main().catch((error) => {
  console.error("[import:google-form] Erreur inattendue");
  console.error(error);
  process.exit(1);
});
