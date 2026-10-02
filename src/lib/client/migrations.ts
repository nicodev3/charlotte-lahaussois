import { coerceContactHours } from "./contactHours.ts";
import { CLIENT_PROFESSIONS } from "./profession.ts";
import {
  defaultFaqItems,
  FAQ_PRESETS,
  matchFaqPresetByQuestion,
  normalizeFaqCustomItems,
} from "./faqPresets.ts";
import { PRACTICE_OFFER_FORM_FAMILIES } from "../practiceOfferFormFamilies.ts";
import { ClientSchema, type ClientConfig } from "./schema.ts";
import { professionSeoCabinetLabel } from "./professionCopy.ts";

export const CURRENT_SCHEMA_VERSION = 25;
const DEFAULT_TEMPLATE_VERSION = "0.1.0";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ClientMigrationError extends Error {}

function requireRecord(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new ClientMigrationError("Client config must be a JSON object.");
  }
  return raw;
}

export function getClientSchemaVersion(raw: unknown): number {
  if (!isRecord(raw)) {
    return 0;
  }

  const version = raw.schemaVersion;
  return typeof version === "number" && Number.isInteger(version) ? version : 0;
}

function migrateV0ToV1(input: unknown): unknown {
  const raw = requireRecord(input);
  return {
    ...raw,
    schemaVersion: 1,
  };
}

function migrateV1ToV2(input: unknown): unknown {
  const raw = requireRecord(input);
  const seoValue = raw.seo;
  if (!isRecord(seoValue)) {
    throw new ClientMigrationError("Missing `seo` object required for v1 -> v2 migration.");
  }

  const baseUrl = seoValue.baseUrl;
  if (typeof baseUrl !== "string" || baseUrl.length === 0) {
    throw new ClientMigrationError("Missing `seo.baseUrl` required for v1 -> v2 migration.");
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return {
    ...raw,
    schemaVersion: 2,
    templateVersion:
      typeof raw.templateVersion === "string" && raw.templateVersion.length > 0
        ? raw.templateVersion
        : DEFAULT_TEMPLATE_VERSION,
    stylePreset:
      raw.stylePreset === "flat" || raw.stylePreset === "soft" || raw.stylePreset === "editorial"
        ? raw.stylePreset
        : "soft",
    colorTheme:
      raw.colorTheme === "sage-soft" ||
      raw.colorTheme === "mocha-soft" ||
      raw.colorTheme === "mist-blue" ||
      raw.colorTheme === "teal-coral" ||
      raw.colorTheme === "cobalt-lime" ||
      raw.colorTheme === "linen-clay" ||
      raw.colorTheme === "serene-practice"
        ? raw.colorTheme
        : "sage-soft",
    seo: {
      ...seoValue,
      ogImage:
        typeof seoValue.ogImage === "string" && seoValue.ogImage.length > 0
          ? seoValue.ogImage
          : `${normalizedBaseUrl}/og.jpg`,
    },
  };
}

function migrateV2ToV3(input: unknown): unknown {
  const raw = requireRecord(input);
  const contact = raw.contact;
  if (!isRecord(contact)) {
    return { ...raw, schemaVersion: 3 };
  }

  const hours = coerceContactHours(contact.hours);

  return {
    ...raw,
    schemaVersion: 3,
    contact: {
      ...contact,
      hours,
    },
  };
}

function migrateV3ToV4(input: unknown): unknown {
  const raw = requireRecord(input);
  const faq = raw.faq;
  const baseItems = defaultFaqItems();

  if (!isRecord(faq)) {
    return { ...raw, schemaVersion: 4, faq: { items: baseItems, customItems: [] } };
  }

  const items = faq.items;
  if (Array.isArray(items)) {
    const enabled = { ...baseItems };
    const customItems: { question: string; answer: string }[] = [];
    for (const entry of items) {
      if (!isRecord(entry)) continue;
      const q = typeof entry.question === "string" ? entry.question : "";
      const preset = matchFaqPresetByQuestion(q);
      if (preset) {
        enabled[preset.id] = true;
        continue;
      }
      const ans = typeof entry.answer === "string" ? entry.answer.trim() : "";
      const qq = q.trim();
      if (qq.length > 0 && ans.length > 0) {
        customItems.push({ question: qq, answer: ans });
      }
    }
    return { ...raw, schemaVersion: 4, faq: { items: enabled, customItems } };
  }

  if (isRecord(items)) {
    const merged = { ...baseItems };
    for (const p of FAQ_PRESETS) {
      merged[p.id] = Boolean((items as Record<string, unknown>)[p.id]);
    }
    const customItems = normalizeFaqCustomItems(faq.customItems);
    return { ...raw, schemaVersion: 4, faq: { items: merged, customItems } };
  }

  return { ...raw, schemaVersion: 4, faq: { items: baseItems, customItems: [] } };
}

function migrateV4ToV5(input: unknown): unknown {
  const raw = requireRecord(input);
  let fallback = 60;
  const practice = raw.practice;
  if (isRecord(practice) && typeof practice.sessionDurationMin === "number") {
    const n = practice.sessionDurationMin;
    fallback = Number.isFinite(n) ? Math.min(180, Math.max(20, Math.round(n))) : 60;
  }

  const pricing = raw.pricing;
  if (isRecord(pricing) && Array.isArray(pricing.items)) {
    raw.pricing = {
      ...pricing,
      items: pricing.items.map((item) => {
        if (!isRecord(item)) return item;
        const cur =
          typeof item.durationMinutes === "number" && !Number.isNaN(item.durationMinutes)
            ? Math.min(180, Math.max(20, Math.round(item.durationMinutes)))
            : fallback;
        return { ...item, durationMinutes: cur };
      }),
    };
  }

  if (isRecord(practice) && "sessionDurationMin" in practice) {
    const { sessionDurationMin: _removed, ...restPractice } = practice as Record<string, unknown>;
    raw.practice = restPractice;
  }

  return { ...raw, schemaVersion: 5 };
}

function migrateV5ToV6(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.map((sec) => {
        if (!isRecord(sec) || sec.type !== "hero") return sec;
        const data = sec.data;
        if (!isRecord(data)) return sec;
        const { title: _removed, ...restData } = data;
        return { ...sec, data: restData };
      }),
    };
  }

  return { ...raw, schemaVersion: 6 };
}

function migrateV6ToV7(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.map((sec) => {
        if (!isRecord(sec) || sec.type !== "hero") return sec;
        const data = sec.data;
        if (!isRecord(data)) return sec;
        const { subtitle: _removed, ...restData } = data;
        return { ...sec, data: restData };
      }),
    };
  }

  return { ...raw, schemaVersion: 7 };
}

function migrateV7ToV8(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.map((sec) => {
        if (!isRecord(sec) || sec.type !== "hero") return sec;
        const data = sec.data;
        if (!isRecord(data)) return sec;
        const { highlightsHeading: _removed, ...restData } = data;
        return { ...sec, data: restData };
      }),
    };
  }

  return { ...raw, schemaVersion: 8 };
}

function migrateV8ToV9(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.map((sec) => {
        if (!isRecord(sec) || sec.type !== "hero") return sec;
        const data = sec.data;
        if (!isRecord(data)) return sec;
        const { highlights: _removed, ...restData } = data;
        return { ...sec, data: restData };
      }),
    };
  }

  return { ...raw, schemaVersion: 9 };
}

function migrateV9ToV10(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.map((sec) => {
        if (!isRecord(sec) || sec.type !== "services") return sec;
        const data = sec.data;
        if (!isRecord(data) || !Array.isArray(data.items)) return sec;
        return {
          ...sec,
          data: {
            ...data,
            items: data.items.map((item) => {
              if (!isRecord(item)) return item;
              const { title: _removed, ...rest } = item;
              return rest;
            }),
          },
        };
      }),
    };
  }

  return { ...raw, schemaVersion: 10 };
}

function migrateV10ToV11(input: unknown): unknown {
  const raw = requireRecord(input);
  const existing = isRecord(raw.optionalPagesFamilyOther)
    ? (raw.optionalPagesFamilyOther as Record<string, unknown>)
    : {};
  const merged: Record<string, string> = {};
  for (const f of PRACTICE_OFFER_FORM_FAMILIES) {
    const v = existing[f.id];
    merged[f.id] = typeof v === "string" ? v : "";
  }

  return { ...raw, schemaVersion: 11, optionalPagesFamilyOther: merged };
}

/** Normalise les entrées « autre approche » par famille (tableau, chaîne multi-lignes, etc.). */
function normalizePracticeOfferCustomApproachesValues(
  existing: Record<string, unknown>,
): Record<string, string[]> {
  const merged: Record<string, string[]> = {};
  for (const f of PRACTICE_OFFER_FORM_FAMILIES) {
    const v = existing[f.id];
    if (Array.isArray(v)) {
      merged[f.id] = v.map((x) => (typeof x === "string" ? x : x == null ? "" : String(x)));
    } else if (typeof v === "string") {
      merged[f.id] = v
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else {
      merged[f.id] = [];
    }
  }
  return merged;
}

function migrateV11ToV12(input: unknown): unknown {
  const raw = requireRecord(input);
  const existing = isRecord(raw.optionalPagesFamilyOther)
    ? (raw.optionalPagesFamilyOther as Record<string, unknown>)
    : {};

  return {
    ...raw,
    schemaVersion: 12,
    optionalPagesFamilyOther: normalizePracticeOfferCustomApproachesValues(existing),
  };
}

function migrateV12ToV13(input: unknown): unknown {
  const raw = requireRecord(input);
  const existingOther = isRecord(raw.optionalPagesFamilyOther)
    ? (raw.optionalPagesFamilyOther as Record<string, unknown>)
    : {};
  const existingPages = isRecord(raw.optionalPages) ? { ...raw.optionalPages } : {};

  const next: Record<string, unknown> = { ...raw, schemaVersion: 13 };
  delete next.optionalPages;
  delete next.optionalPagesFamilyOther;
  next.practicePageEnabled = existingPages;
  next.practiceOfferCustomApproaches = normalizePracticeOfferCustomApproachesValues(existingOther);
  return next;
}

function migrateV13ToV14(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.map((sec) => {
        if (!isRecord(sec) || sec.type !== "services") return sec;
        const data = sec.data;
        if (!isRecord(data)) return sec;
        const { items: _removed, ...restData } = data as Record<string, unknown> & {
          items?: unknown;
        };
        return { ...sec, data: restData };
      }),
    };
  }

  return { ...raw, schemaVersion: 14 };
}

function migrateV14ToV15(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.filter((sec) => {
        if (!isRecord(sec)) return true;
        return sec.type !== "trust";
      }),
    };
  }

  return { ...raw, schemaVersion: 15 };
}

function migrateV15ToV16(input: unknown): unknown {
  const raw = requireRecord(input);
  const homepage = raw.homepage;
  if (isRecord(homepage) && Array.isArray(homepage.sections)) {
    raw.homepage = {
      ...homepage,
      sections: homepage.sections.filter((sec) => {
        if (!isRecord(sec)) return true;
        return sec.type !== "process" && sec.type !== "cta";
      }),
    };
  }

  return { ...raw, schemaVersion: 16 };
}

function migrateV16ToV17(input: unknown): unknown {
  const raw = requireRecord(input);
  return { ...raw, schemaVersion: 17 };
}

const ALLOWED_PROFESSIONS = new Set<string>(CLIENT_PROFESSIONS);

function migrateV17ToV18(input: unknown): unknown {
  const raw = requireRecord(input);
  let profession = raw.profession;
  if (typeof profession !== "string" || !ALLOWED_PROFESSIONS.has(profession)) {
    profession = "psychologue";
  }

  const out: Record<string, unknown> = { ...raw, schemaVersion: 18, profession };

  if (profession === "psychomotricien" && isRecord(out.practice)) {
    const practice = { ...(out.practice as Record<string, unknown>) };
    const reimbursement = isRecord(practice.reimbursement)
      ? { ...(practice.reimbursement as Record<string, unknown>) }
      : {};
    const msp = isRecord(reimbursement.monSoutienPsy)
      ? { ...(reimbursement.monSoutienPsy as Record<string, unknown>) }
      : { enabled: false, note: "À vérifier selon votre situation." };
    msp.enabled = false;
    reimbursement.monSoutienPsy = msp;
    practice.reimbursement = reimbursement;
    out.practice = practice;
  }

  return out;
}

function migrateV18ToV19(input: unknown): unknown {
  const raw = requireRecord(input);
  const out: Record<string, unknown> = { ...raw, schemaVersion: 19 };
  delete out.templateVersion;
  delete out.template;
  delete out.stylePreset;
  delete out.colorTheme;
  delete out.theme;
  delete out.booking;
  if (isRecord(out.contact)) {
    const contact = { ...out.contact };
    delete contact.transport;
    delete contact.accessibility;
    out.contact = contact;
  }
  return out;
}

function migrateV19ToV20(input: unknown): unknown {
  const raw = requireRecord(input);
  const out: Record<string, unknown> = { ...raw, schemaVersion: 20 };
  delete out.faq;
  return out;
}

function migrateV20ToV21(input: unknown): unknown {
  const raw = requireRecord(input);
  const out: Record<string, unknown> = { ...raw, schemaVersion: 21 };
  delete out.homepage;
  return out;
}

function migrateV21ToV22(input: unknown): unknown {
  const raw = requireRecord(input);
  const out: Record<string, unknown> = { ...raw, schemaVersion: 22 };
  if (isRecord(out.conditions)) {
    const conditions = { ...out.conditions };
    delete conditions.frequency;
    out.conditions = conditions;
  }
  return out;
}

/** `contact.form.enabled` → `contact.channels.selected` (email/téléphone étaient déjà toujours affichés). */
function migrateV22ToV23(input: unknown): unknown {
  const raw = requireRecord(input);
  const out: Record<string, unknown> = { ...raw, schemaVersion: 23 };
  if (isRecord(out.contact)) {
    const contact = { ...out.contact };
    const formEnabled = isRecord(contact.form) && contact.form.enabled === true;
    delete contact.form;
    const selected = ["email", "phone"];
    if (formEnabled) selected.push("form");
    contact.channels = { selected, other: undefined };
    out.contact = contact;
  }
  return out;
}

/**
 * v24 : complément d’adresse, URL RDV, accès cabinet, WhatsApp distinct,
 * public familles, domicile, note délais, tarif adapté (champs optionnels).
 */
function migrateV23ToV24(input: unknown): unknown {
  const raw = requireRecord(input);
  return { ...raw, schemaVersion: 24 };
}

/** v25 : le menu est dérivé des pages Astro (`pageNav`), `nav` quitte le contrat. */
function migrateV24ToV25(input: unknown): unknown {
  const out: Record<string, unknown> = { ...requireRecord(input), schemaVersion: 25 };
  delete out.nav;
  return out;
}

/** Étape n : migre un fichier `schemaVersion === n` vers `n + 1`. */
const MIGRATION_STEPS: readonly ((raw: unknown) => unknown)[] = [
  migrateV0ToV1,
  migrateV1ToV2,
  migrateV2ToV3,
  migrateV3ToV4,
  migrateV4ToV5,
  migrateV5ToV6,
  migrateV6ToV7,
  migrateV7ToV8,
  migrateV8ToV9,
  migrateV9ToV10,
  migrateV10ToV11,
  migrateV11ToV12,
  migrateV12ToV13,
  migrateV13ToV14,
  migrateV14ToV15,
  migrateV15ToV16,
  migrateV16ToV17,
  migrateV17ToV18,
  migrateV18ToV19,
  migrateV19ToV20,
  migrateV20ToV21,
  migrateV21ToV22,
  migrateV22ToV23,
  migrateV23ToV24,
  migrateV24ToV25,
];

if (MIGRATION_STEPS.length !== CURRENT_SCHEMA_VERSION) {
  throw new Error(
    `[migrations] ${MIGRATION_STEPS.length} étapes déclarées pour CURRENT_SCHEMA_VERSION=${CURRENT_SCHEMA_VERSION}.`,
  );
}

export function migrateClientConfig(raw: unknown): unknown {
  let migrated = raw;
  let version = getClientSchemaVersion(migrated);

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new ClientMigrationError(
      `Unsupported schemaVersion ${version}. Current supported version is ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  while (version < CURRENT_SCHEMA_VERSION) {
    migrated = MIGRATION_STEPS[version]!(migrated);
    const next = getClientSchemaVersion(migrated);
    if (next !== version + 1) {
      throw new ClientMigrationError(
        `Migration v${version} → v${version + 1} a produit schemaVersion ${next}.`,
      );
    }
    version = next;
  }

  return coerceContactHoursIfStillArray(migrated);
}

/** Repare les fichiers où `schemaVersion` est ≥ 3 mais `contact.hours` reste un tableau hérité. */
function coerceContactHoursIfStillArray(migrated: unknown): unknown {
  if (!isRecord(migrated)) return migrated;
  const contact = migrated.contact;
  if (!isRecord(contact) || !Array.isArray(contact.hours)) return migrated;
  return {
    ...migrated,
    contact: {
      ...contact,
      hours: coerceContactHours(contact.hours),
    },
  };
}

export function parseClientConfig(raw: unknown): ClientConfig {
  const migrated = migrateClientConfig(raw);
  const parsed = ClientSchema.parse(migrated);

  return {
    ...parsed,
    seo: {
      ...parsed.seo,
      siteName: `${parsed.business.fullName} — ${professionSeoCabinetLabel(parsed.profession)} à ${parsed.business.city}`,
    },
  };
}
