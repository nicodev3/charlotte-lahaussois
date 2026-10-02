import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { REGISTERED_PRACTICE_PAGES } from "../src/lib/practicePageRegistry.ts";

const schemaPath = path.resolve(process.cwd(), "form-schema.json");
const outPath = path.resolve(process.cwd(), "generated/google-form-generator.gs");

function flattenFields(schema) {
  const fields = [];
  for (const section of schema.sections ?? []) {
    for (const field of section.fields ?? []) {
      fields.push(field);
    }
  }
  return fields;
}

/** Aligne les choix du formulaire Google sur le registre des pages pratique (libellés lisibles). */
function syncPracticePageEnabledSelection(schema) {
  for (const section of schema.sections ?? []) {
    for (const field of section.fields ?? []) {
      if (field.id !== "practicePageEnabledSelection" || field.type !== "checkboxes") continue;
      field.options = REGISTERED_PRACTICE_PAGES.map((page) => ({
        label: page.navLabel,
        value: page.id,
      }));
    }
  }
}

function assertUniqueLabels(schema) {
  const seen = new Map();
  for (const field of flattenFields(schema)) {
    const previous = seen.get(field.label);
    if (previous) {
      throw new Error(
        `Duplicate form label "${field.label}" for ${previous} and ${field.id}. Labels must be unique.`,
      );
    }
    seen.set(field.label, field.id);
  }
}

function appsScriptSource(schema) {
  const compactSchema = JSON.stringify(schema);
  const ids = flattenFields(schema).map((field) => field.id);

  return `/**
 * Generated from form-schema.json.
 * Procedure:
 * 1. Open https://script.google.com/
 * 2. Create a new project.
 * 3. Paste this whole file into Code.gs.
 * 4. Run createClientIntakeForm().
 */

const FORM_SCHEMA_JSON = ${JSON.stringify(compactSchema)};

function createClientIntakeForm() {
  const schema = JSON.parse(FORM_SCHEMA_JSON);
  const form = FormApp.create(schema.title);
  form.setDescription(schema.description || "");
  form.setCollectEmail(true);
  form.setProgressBar(true);
  form.setConfirmationMessage("Merci, vos reponses ont bien ete enregistrees.");

  schema.sections.forEach(function(section, sectionIndex) {
    if (sectionIndex > 0) {
      form.addPageBreakItem()
        .setTitle(section.title)
        .setHelpText(section.description || "");
    } else if (section.description) {
      form.addSectionHeaderItem()
        .setTitle(section.title)
        .setHelpText(section.description || "");
    } else {
      form.addSectionHeaderItem().setTitle(section.title);
    }

    section.fields.forEach(function(field) {
      addField_(form, field);
    });
  });

  const sheet = SpreadsheetApp.create(schema.title + " - reponses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log("Form URL: " + form.getEditUrl());
  Logger.log("Public URL: " + form.getPublishedUrl());
  Logger.log("Responses Sheet: " + sheet.getUrl());
  return {
    editUrl: form.getEditUrl(),
    publicUrl: form.getPublishedUrl(),
    spreadsheetUrl: sheet.getUrl()
  };
}

function addField_(form, field) {
  const title = field.label;
  let item;

  if (field.type === "shortText") {
    item = form.addTextItem();
  } else if (field.type === "longText") {
    item = form.addParagraphTextItem();
  } else if (field.type === "number") {
    item = form.addTextItem();
    item.setValidation(FormApp.createTextValidation().requireNumber().build());
  } else if (field.type === "singleChoice") {
    item = form.addMultipleChoiceItem();
    item.setChoiceValues(field.options.map(function(option) { return option.label; }));
  } else if (field.type === "checkboxes") {
    item = form.addCheckboxItem();
    item.setChoiceValues(field.options.map(function(option) { return option.label; }));
    if (field.maxSelected) {
      item.setValidation(
        FormApp.createCheckboxValidation()
          .requireSelectAtMost(Number(field.maxSelected))
          .build()
      );
    }
  } else {
    throw new Error("Unsupported field type: " + field.type);
  }

  item.setTitle(title);
  item.setRequired(Boolean(field.required));
  if (field.helpText) {
    item.setHelpText(field.helpText);
  } else if (field.format === "credentialLines") {
    item.setHelpText("Une ligne par entree. Format conseille : Intitule | Organisme ou etablissement | Annee");
  } else if (field.format === "lines") {
    item.setHelpText("Une ligne par entree.");
  }
}

function getExpectedFieldIds() {
  return ${JSON.stringify(ids, null, 2)};
}
`;
}

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  syncPracticePageEnabledSelection(schema);
  assertUniqueLabels(schema);
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, appsScriptSource(schema), "utf8");
  console.log(`[form:google:script] OK - ${outPath}`);
}

main().catch((error) => {
  console.error("[form:google:script] Erreur inattendue");
  console.error(error);
  process.exit(1);
});
