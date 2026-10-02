import { ClientMigrationError, migrateClientConfig } from "../client/migrations.ts";
import { ClientSchema, type ClientConfig } from "../client/schema.ts";
import { FORMSPREE_FORM_ID } from "../constants.ts";
import { PRACTICE_OFFER_FORM_FAMILIES } from "../practiceOfferFormFamilies.ts";
import { REGISTERED_PRACTICE_PAGES } from "../practicePageRegistry.ts";
import { deepClone } from "./clientConfigFormUtils.ts";
import {
  enrichClientValidationIssues,
  type ClientValidationIssue,
} from "./clientConfigValidationUI.ts";
import type { z } from "zod";

export type { ClientValidationIssue };

export type ValidateResult =
  { ok: true; data: ClientConfig } | { ok: false; issues: ClientValidationIssue[] };

function formatIssues(issues: z.core.$ZodIssue[]): { path: string; message: string }[] {
  return issues.map((i) => ({
    path: i.path.length ? i.path.join(".") : "root",
    message: i.message,
  }));
}

/** Assure toutes les clés `practicePageEnabled` du registre (booléens, défaut false). */
export function mergePracticePageEnabledDefaults(raw: Record<string, unknown>): void {
  let op = raw.practicePageEnabled;
  if (op == null || typeof op !== "object" || Array.isArray(op)) {
    op = {};
    raw.practicePageEnabled = op;
  }
  const o = op as Record<string, boolean>;
  for (const t of REGISTERED_PRACTICE_PAGES) {
    if (!(t.id in o)) o[t.id] = false;
  }
}

/** Assure toutes les clés `practiceOfferCustomApproaches` (tableaux de chaînes par famille du formulaire). */
export function mergePracticeOfferCustomApproachesDefaults(raw: Record<string, unknown>): void {
  let op = raw.practiceOfferCustomApproaches;
  if (op == null || typeof op !== "object" || Array.isArray(op)) {
    op = {};
    raw.practiceOfferCustomApproaches = op;
  }
  const o = op as Record<string, unknown>;
  for (const f of PRACTICE_OFFER_FORM_FAMILIES) {
    if (!(f.id in o)) {
      o[f.id] = [];
      continue;
    }
    const v = o[f.id];
    if (Array.isArray(v)) {
      o[f.id] = v.map((x) => (typeof x === "string" ? x : x == null ? "" : String(x)));
    } else if (typeof v === "string") {
      o[f.id] = v
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      o[f.id] = [];
    }
  }
}

export function validateClientJsonRaw(raw: unknown): ValidateResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {
      ok: false,
      issues: enrichClientValidationIssues([
        { path: "root", message: "La configuration doit être un objet JSON." },
      ]),
    };
  }
  const draft = deepClone(raw) as Record<string, unknown>;
  mergePracticePageEnabledDefaults(draft);
  mergePracticeOfferCustomApproachesDefaults(draft);

  try {
    const migrated = migrateClientConfig(draft);
    const parsed = ClientSchema.safeParse(migrated);
    if (!parsed.success) {
      return { ok: false, issues: enrichClientValidationIssues(formatIssues(parsed.error.issues)) };
    }
    if (
      parsed.data.contact.channels.selected.includes("form") &&
      FORMSPREE_FORM_ID.trim().length === 0
    ) {
      return {
        ok: false,
        issues: enrichClientValidationIssues([
          {
            path: "contact.channels.selected",
            message:
              "Formulaire de contact sélectionné : renseignez FORMSPREE_FORM_ID dans src/lib/constants.ts (côté intégrateur).",
          },
        ]),
      };
    }
    return { ok: true, data: parsed.data };
  } catch (e) {
    if (e instanceof ClientMigrationError) {
      return {
        ok: false,
        issues: enrichClientValidationIssues([{ path: "root", message: e.message }]),
      };
    }
    throw e;
  }
}
