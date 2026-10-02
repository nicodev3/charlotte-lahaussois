import { migrateClientConfig } from "../lib/client/migrations.ts";
import { PRACTICE_OFFER_FORM_FAMILIES } from "../lib/practiceOfferFormFamilies.ts";
import { REGISTERED_PRACTICE_PAGES } from "../lib/practicePageRegistry.ts";
import {
  deepClone,
  el,
  getAt,
  setAt,
  attachClientConfigPath,
  clearClientConfigFieldHighlights,
  highlightClientConfigFieldsForPaths,
  CLIENT_CONFIG_FIELD_INVALID_CLASS,
} from "../lib/dev/clientConfigFormUtils.ts";
import {
  mergePracticePageEnabledDefaults,
  mergePracticeOfferCustomApproachesDefaults,
  validateClientJsonRaw,
} from "../lib/dev/clientConfigFormValidate.ts";
import type { ClientValidationIssue } from "../lib/dev/clientConfigValidationUI.ts";

import {
  CONTACT_HOURS_WEEKDAY_LABELS,
  CONTACT_HOURS_WEEKDAY_ORDER,
  coerceContactHours,
} from "../lib/client/contactHours.ts";
import {
  SPECIALTY_MOTIF_LABEL_SET,
  SPECIALTY_MOTIF_ORDERED_LABELS,
  SPECIALTY_MOTIF_SECTIONS,
} from "../lib/client/specialtyMotifSections.ts";

type TabId = "business" | "practice" | "optional" | "cabinet";

const TABS: { id: TabId; label: string }[] = [
  { id: "business", label: "Vos informations" },
  { id: "practice", label: "Votre pratique" },
  { id: "optional", label: "Offre de soins" },
  { id: "cabinet", label: "Cabinet & tarifs" },
];

const REGISTRATION_LABEL_OPTIONS = [
  { value: "adeli", label: "ADELI" },
  { value: "rpps", label: "RPPS" },
] as const;

const PROFESSION_FORM_OPTIONS = [
  { value: "psychologue", label: "Psychologue" },
  { value: "psychomotricien", label: "Psychomotricien(ne)" },
] as const;

function ensureRecord(path: string, state: Record<string, unknown>): Record<string, unknown> {
  const v = getAt(state, path);
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  const parentPath = path.includes(".") ? path.slice(0, path.lastIndexOf(".")) : "";
  const key = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1) : path;
  const o: Record<string, unknown> = {};
  if (parentPath) {
    const existing = getAt(state, parentPath);
    const base =
      existing && typeof existing === "object" && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>) }
        : {};
    base[key] = o;
    setAt(state, parentPath, base);
  } else {
    state[key] = o;
  }
  return o;
}

function ensureArray(path: string, state: Record<string, unknown>): unknown[] {
  const v = getAt(state, path);
  if (Array.isArray(v)) return v;
  setAt(state, path, []);
  return getAt(state, path) as unknown[];
}

function normalizeContactHoursInFormState(state: Record<string, unknown>): void {
  const contact = state.contact;
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) return;
  const c = contact as Record<string, unknown>;
  c.hours = coerceContactHours(c.hours);
}

/** Libellés de champs. */
const FORM_LABEL_CLASS = "block text-sm font-medium text-fg";

/** Libellés des cases à cocher / radios. */
const FORM_CHECK_LABEL_CLASS =
  "flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-fg transition-colors hover:border-muted/20 hover:bg-accent/50";

/** Onglet « Offre de soins » : densifié. */
const PRACTICE_OFFER_FORM_TEXT_CLASS = "text-sm leading-normal";
const PRACTICE_OFFER_FORM_LABEL_CLASS = `block ${PRACTICE_OFFER_FORM_TEXT_CLASS} font-medium text-fg`;
const PRACTICE_OFFER_FORM_CHECK_CLASS = `flex cursor-pointer items-start gap-2.5 rounded-md px-1 py-1 ${PRACTICE_OFFER_FORM_TEXT_CLASS} font-medium text-fg transition-colors hover:bg-accent/60`;

/** Titre de section dans un panneau. */
const FORM_SECTION_TITLE_CLASS = "text-base font-semibold tracking-tight text-fg";

/** Panneau de regroupement. */
const FORM_SECTION_PANEL_CLASS =
  "space-y-4 rounded-2xl border border-muted/20 bg-bg p-5 shadow-sm md:p-6";

/** Contrôles texte / select / textarea. */
const FORM_CONTROL_CLASS =
  "w-full rounded-xl border border-muted/25 bg-bg px-3.5 py-2.5 text-sm text-fg shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

/** Boutons secondaires (ajouter / actions légères). */
const FORM_BTN_SECONDARY_CLASS =
  "inline-flex items-center justify-center rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15";

/** Boutons destructifs légers. */
const FORM_BTN_DANGER_CLASS =
  "text-sm font-medium text-red-700 transition-colors hover:text-red-800 hover:underline disabled:cursor-not-allowed disabled:opacity-40";

function fieldWrap(
  labelText: string,
  control: HTMLElement,
  labelClass: string = FORM_LABEL_CLASS,
): HTMLElement {
  const wrap = el("div", "space-y-1.5");
  const lab = el("label", labelClass, undefined, [labelText]);
  wrap.appendChild(lab);
  wrap.appendChild(control);
  return wrap;
}

function sectionHeading(title: string): HTMLElement {
  return el("p", FORM_SECTION_TITLE_CLASS, undefined, [title]);
}

/** Une colonne sur mobile ; à partir de md, plusieurs colonnes pour gagner de la hauteur sur desktop. */
function desktopFieldGrid(cols: 2 | 3, ...fields: HTMLElement[]): HTMLElement {
  const cls = cols === 3 ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "grid gap-4 md:grid-cols-2";
  const row = el("div", cls);
  for (const f of fields) row.appendChild(f);
  return row;
}

function textInput(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
  opts?: string | { placeholder?: string; textClass?: string; disabled?: boolean },
): HTMLInputElement {
  const o = typeof opts === "string" ? { placeholder: opts } : (opts ?? {});
  const textClass = o.textClass ?? "text-sm";
  const inp = el(
    "input",
    `${FORM_CONTROL_CLASS} ${textClass}${o.disabled ? " cursor-not-allowed opacity-50" : ""}`,
  ) as HTMLInputElement;
  inp.type = "text";
  if (o.placeholder) inp.placeholder = o.placeholder;
  if (o.disabled) inp.disabled = true;
  const cur = getAt(state, path);
  inp.value = cur == null ? "" : String(cur);
  inp.addEventListener("input", () => {
    setAt(state, path, inp.value);
    onRefresh();
  });
  attachClientConfigPath(inp, path);
  return inp;
}

function numberInput(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
  min?: number,
  max?: number,
): HTMLInputElement {
  const inp = el("input", FORM_CONTROL_CLASS) as HTMLInputElement;
  inp.type = "number";
  if (min != null) inp.min = String(min);
  if (max != null) inp.max = String(max);
  const cur = getAt(state, path);
  inp.value = cur == null || cur === "" ? "" : String(cur);
  inp.addEventListener("input", () => {
    const v = inp.value === "" ? undefined : Number(inp.value);
    setAt(state, path, Number.isNaN(v as number) ? undefined : v);
    onRefresh();
  });
  attachClientConfigPath(inp, path);
  return inp;
}

function textareaInput(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
  rows = 3,
): HTMLTextAreaElement {
  const ta = el("textarea", `${FORM_CONTROL_CLASS} min-h-24 resize-y`) as HTMLTextAreaElement;
  ta.rows = rows;
  const cur = getAt(state, path);
  ta.value = cur == null ? "" : String(cur);
  ta.addEventListener("input", () => {
    setAt(state, path, ta.value);
    onRefresh();
  });
  attachClientConfigPath(ta, path);
  return ta;
}

function selectLabeled(
  state: Record<string, unknown>,
  path: string,
  options: readonly { value: string; label: string }[],
  onRefresh: () => void,
): HTMLSelectElement {
  const sel = el("select", FORM_CONTROL_CLASS) as HTMLSelectElement;
  const values = options.map((o) => o.value);
  for (const o of options) {
    const opt = document.createElement("option");
    opt.value = o.value;
    opt.textContent = o.label;
    sel.appendChild(opt);
  }
  const cur = getAt(state, path);
  sel.value = cur != null && values.includes(String(cur)) ? String(cur) : options[0]!.value;
  sel.addEventListener("change", () => {
    setAt(state, path, sel.value);
    onRefresh();
  });
  attachClientConfigPath(sel, path);
  return sel;
}

function checkboxInput(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
  label: string,
  labelClass: string = FORM_CHECK_LABEL_CLASS,
): HTMLElement {
  const wrap = el("label", labelClass);
  const inp = el(
    "input",
    "mt-0.5 size-4 shrink-0 rounded border-muted/40 text-primary accent-primary",
  ) as HTMLInputElement;
  inp.type = "checkbox";
  const cur = getAt(state, path);
  inp.checked = Boolean(cur);
  inp.addEventListener("change", () => {
    setAt(state, path, inp.checked);
    onRefresh();
  });
  wrap.appendChild(inp);
  wrap.appendChild(el("span", "leading-snug", undefined, [label]));
  attachClientConfigPath(wrap, path);
  return wrap;
}

function registrationLabelRadioGroup(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
  onTypeChange?: () => void,
): HTMLElement {
  const root = el("div", "space-y-2");
  root.appendChild(el("span", FORM_LABEL_CLASS, undefined, ["Type d’inscription"]));
  const group = el("div", "flex flex-wrap gap-2");
  const cur = getAt(state, path) === "rpps" ? "rpps" : "adeli";
  const name = `registration-label-${path.replace(/\./g, "-")}`;
  const selectedClass =
    "flex cursor-pointer items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-colors";
  const idleClass =
    "flex cursor-pointer items-center gap-2 rounded-xl border border-muted/25 bg-bg px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:border-muted/40 hover:bg-accent/40";
  const rows: { inp: HTMLInputElement; row: HTMLElement; value: string }[] = [];
  for (const opt of REGISTRATION_LABEL_OPTIONS) {
    const row = el("label", cur === opt.value ? selectedClass : idleClass);
    const inp = el("input", "size-4 border-muted/40 accent-primary") as HTMLInputElement;
    inp.type = "radio";
    inp.name = name;
    inp.value = opt.value;
    inp.checked = cur === opt.value;
    inp.addEventListener("change", () => {
      if (inp.checked) {
        setAt(state, path, opt.value);
        for (const r of rows) {
          r.row.className = r.value === opt.value ? selectedClass : idleClass;
        }
        onRefresh();
        onTypeChange?.();
      }
    });
    row.appendChild(inp);
    row.appendChild(document.createTextNode(opt.label));
    group.appendChild(row);
    rows.push({ inp, row, value: opt.value });
  }
  root.appendChild(group);
  attachClientConfigPath(root, path);
  return root;
}

const AUDIENCE_OPTIONS = [
  { value: "enfants", label: "Enfants" },
  { value: "adolescents", label: "Adolescents" },
  { value: "adultes", label: "Adultes" },
  { value: "couples", label: "Couples" },
  { value: "familles", label: "Familles" },
  { value: "autre", label: "Autre (préciser)" },
] as const;

const AUDIENCE_IDS = new Set<string>(AUDIENCE_OPTIONS.map((o) => o.value));

function readAudienceSelection(path: string, state: Record<string, unknown>): Set<string> {
  const cur = getAt(state, path);
  const arr = Array.isArray(cur) ? (cur as string[]) : [];
  return new Set(arr.filter((v) => AUDIENCE_IDS.has(v)));
}

function writeAudienceSelection(
  state: Record<string, unknown>,
  audiencePath: string,
  otherPath: string,
  selected: Set<string>,
  onRefresh: () => void,
): void {
  const ordered = AUDIENCE_OPTIONS.map((o) => o.value).filter((v) => selected.has(v));
  setAt(state, audiencePath, ordered);
  if (!selected.has("autre")) {
    setAt(state, otherPath, "");
  }
  onRefresh();
}

/** Cases à cocher pour `practice.audience` + champ libre si « autre ». */
function audienceCheckboxGroup(
  state: Record<string, unknown>,
  audiencePath: string,
  otherPath: string,
  onRefresh: () => void,
): HTMLElement {
  const root = el("div", "space-y-2");
  const refreshAutreUi = (otherWrap: HTMLElement, autreChecked: boolean) => {
    otherWrap.classList.toggle("hidden", !autreChecked);
  };

  for (const opt of AUDIENCE_OPTIONS) {
    if (opt.value === "autre") {
      const block = el("div", "space-y-2");
      const row = el("label", FORM_CHECK_LABEL_CLASS);
      const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
      inp.type = "checkbox";
      const sel = readAudienceSelection(audiencePath, state);
      inp.checked = sel.has("autre");
      const otherWrap = el("div", "ml-6 space-y-1");
      const otherInp = textInput(state, otherPath, onRefresh, "Préciser le public…");
      inp.addEventListener("change", () => {
        const s = readAudienceSelection(audiencePath, state);
        if (inp.checked) s.add("autre");
        else s.delete("autre");
        writeAudienceSelection(state, audiencePath, otherPath, s, onRefresh);
        if (!s.has("autre")) {
          otherInp.value = "";
        }
        refreshAutreUi(otherWrap, s.has("autre"));
      });
      refreshAutreUi(otherWrap, sel.has("autre"));
      row.appendChild(inp);
      row.appendChild(document.createTextNode(opt.label));
      block.appendChild(row);
      otherWrap.appendChild(otherInp);
      block.appendChild(otherWrap);
      root.appendChild(block);
      continue;
    }

    const row = el("label", FORM_CHECK_LABEL_CLASS);
    const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
    inp.type = "checkbox";
    const sel = readAudienceSelection(audiencePath, state);
    inp.checked = sel.has(opt.value);
    inp.addEventListener("change", () => {
      const s = readAudienceSelection(audiencePath, state);
      if (inp.checked) s.add(opt.value);
      else s.delete(opt.value);
      writeAudienceSelection(state, audiencePath, otherPath, s, onRefresh);
      inp.checked = s.has(opt.value);
    });
    row.appendChild(inp);
    row.appendChild(document.createTextNode(opt.label));
    root.appendChild(row);
  }

  attachClientConfigPath(root, audiencePath);
  return root;
}

const CONSULTATION_MODE_OPTIONS = [
  { value: "cabinet", label: "Cabinet" },
  { value: "visio", label: "Visio" },
  { value: "domicile", label: "Domicile" },
] as const;

const CONSULTATION_MODE_IDS = new Set<string>(CONSULTATION_MODE_OPTIONS.map((o) => o.value));

function readConsultationModeSelection(path: string, state: Record<string, unknown>): Set<string> {
  const cur = getAt(state, path);
  const arr = Array.isArray(cur) ? (cur as string[]) : [];
  return new Set(arr.filter((v) => CONSULTATION_MODE_IDS.has(v)));
}

function writeConsultationModeSelection(
  state: Record<string, unknown>,
  modesPath: string,
  selected: Set<string>,
  onRefresh: () => void,
): void {
  const ordered = CONSULTATION_MODE_OPTIONS.map((o) => o.value).filter((v) => selected.has(v));
  setAt(state, modesPath, ordered);
  onRefresh();
}

function consultationModesCheckboxGroup(
  state: Record<string, unknown>,
  modesPath: string,
  onRefresh: () => void,
): HTMLElement {
  const root = el("div", "space-y-2");
  for (const opt of CONSULTATION_MODE_OPTIONS) {
    const row = el("label", FORM_CHECK_LABEL_CLASS);
    const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
    inp.type = "checkbox";
    const sel = readConsultationModeSelection(modesPath, state);
    inp.checked = sel.has(opt.value);
    inp.addEventListener("change", () => {
      const s = readConsultationModeSelection(modesPath, state);
      if (inp.checked) s.add(opt.value);
      else s.delete(opt.value);
      writeConsultationModeSelection(state, modesPath, s, onRefresh);
      inp.checked = s.has(opt.value);
    });
    row.appendChild(inp);
    row.appendChild(document.createTextNode(opt.label));
    root.appendChild(row);
  }
  attachClientConfigPath(root, modesPath);
  return root;
}

const CONTACT_CHANNEL_OPTIONS = [
  { value: "form", label: "Formulaire de contact" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "Bouton WhatsApp" },
  { value: "phone", label: "Téléphone" },
  { value: "doctolib", label: "Doctolib (messagerie / RDV)" },
  { value: "other", label: "Autre" },
] as const;

const CONTACT_CHANNEL_IDS = new Set<string>(CONTACT_CHANNEL_OPTIONS.map((o) => o.value));

function readContactChannelSelection(path: string, state: Record<string, unknown>): Set<string> {
  const cur = getAt(state, path);
  const arr = Array.isArray(cur) ? (cur as string[]) : [];
  return new Set(arr.filter((v) => CONTACT_CHANNEL_IDS.has(v)));
}

function writeContactChannelSelection(
  state: Record<string, unknown>,
  channelsPath: string,
  otherPath: string,
  whatsappPhonePath: string,
  selected: Set<string>,
  onRefresh: () => void,
): void {
  const ordered = CONTACT_CHANNEL_OPTIONS.map((o) => o.value).filter((v) => selected.has(v));
  setAt(state, channelsPath, ordered);
  if (!selected.has("other")) {
    setAt(state, otherPath, "");
  }
  if (!selected.has("whatsapp")) {
    setAt(state, whatsappPhonePath, "");
  }
  onRefresh();
}

/** Cases à cocher pour `contact.channels.selected` + champs conditionnels. */
function contactChannelsCheckboxGroup(
  state: Record<string, unknown>,
  channelsPath: string,
  otherPath: string,
  whatsappPhonePath: string,
  onRefresh: () => void,
): HTMLElement {
  const root = el("div", "space-y-2");
  const refreshNestedUi = (wrap: HTMLElement, visible: boolean) => {
    wrap.classList.toggle("hidden", !visible);
  };

  for (const opt of CONTACT_CHANNEL_OPTIONS) {
    if (opt.value === "other") {
      const block = el("div", "space-y-2");
      const row = el("label", FORM_CHECK_LABEL_CLASS);
      const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
      inp.type = "checkbox";
      const sel = readContactChannelSelection(channelsPath, state);
      inp.checked = sel.has("other");
      const otherWrap = el("div", "ml-6 space-y-1");
      const otherInp = textInput(state, otherPath, onRefresh, "Préciser le canal de contact…");
      inp.addEventListener("change", () => {
        const s = readContactChannelSelection(channelsPath, state);
        if (inp.checked) s.add("other");
        else s.delete("other");
        writeContactChannelSelection(
          state,
          channelsPath,
          otherPath,
          whatsappPhonePath,
          s,
          onRefresh,
        );
        if (!s.has("other")) {
          otherInp.value = "";
        }
        refreshNestedUi(otherWrap, s.has("other"));
      });
      refreshNestedUi(otherWrap, sel.has("other"));
      row.appendChild(inp);
      row.appendChild(document.createTextNode(opt.label));
      block.appendChild(row);
      otherWrap.appendChild(otherInp);
      block.appendChild(otherWrap);
      root.appendChild(block);
      continue;
    }

    if (opt.value === "whatsapp") {
      const block = el("div", "space-y-2");
      const row = el("label", FORM_CHECK_LABEL_CLASS);
      const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
      inp.type = "checkbox";
      const sel = readContactChannelSelection(channelsPath, state);
      inp.checked = sel.has("whatsapp");
      const waWrap = el("div", "ml-6 space-y-1");
      waWrap.appendChild(
        fieldWrap(
          "Numéro WhatsApp (optionnel si identique au téléphone)",
          textInput(state, whatsappPhonePath, onRefresh, "Ex. 06 12 34 56 78"),
        ),
      );
      inp.addEventListener("change", () => {
        const s = readContactChannelSelection(channelsPath, state);
        if (inp.checked) s.add("whatsapp");
        else s.delete("whatsapp");
        writeContactChannelSelection(
          state,
          channelsPath,
          otherPath,
          whatsappPhonePath,
          s,
          onRefresh,
        );
        refreshNestedUi(waWrap, s.has("whatsapp"));
      });
      refreshNestedUi(waWrap, sel.has("whatsapp"));
      row.appendChild(inp);
      row.appendChild(document.createTextNode(opt.label));
      block.appendChild(row);
      block.appendChild(waWrap);
      root.appendChild(block);
      continue;
    }

    const row = el("label", FORM_CHECK_LABEL_CLASS);
    const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
    inp.type = "checkbox";
    const sel = readContactChannelSelection(channelsPath, state);
    inp.checked = sel.has(opt.value);
    inp.addEventListener("change", () => {
      const s = readContactChannelSelection(channelsPath, state);
      if (inp.checked) s.add(opt.value);
      else s.delete(opt.value);
      writeContactChannelSelection(state, channelsPath, otherPath, whatsappPhonePath, s, onRefresh);
      inp.checked = s.has(opt.value);
    });
    row.appendChild(inp);
    row.appendChild(document.createTextNode(opt.label));
    root.appendChild(row);
  }

  attachClientConfigPath(root, channelsPath);
  return root;
}

const FORM_SPECIALTY_MOTIF_CHECK_CLASS =
  "flex cursor-pointer items-start gap-2.5 rounded-md px-1 py-1 text-sm font-medium text-fg transition-colors hover:bg-accent/60";

function readSpecialtiesStringArray(path: string, state: Record<string, unknown>): string[] {
  const cur = getAt(state, path);
  if (!Array.isArray(cur)) return [];
  return cur
    .map((x) => (typeof x === "string" ? x : x == null ? "" : String(x)))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function readPresetSpecialtyMotifSelection(
  path: string,
  state: Record<string, unknown>,
): Set<string> {
  const arr = readSpecialtiesStringArray(path, state);
  return new Set(arr.filter((s) => SPECIALTY_MOTIF_LABEL_SET.has(s)));
}

function readCustomSpecialtyLines(path: string, state: Record<string, unknown>): string[] {
  return readSpecialtiesStringArray(path, state).filter((s) => !SPECIALTY_MOTIF_LABEL_SET.has(s));
}

function writePracticeSpecialtiesFromForm(
  state: Record<string, unknown>,
  path: string,
  presetSelected: Set<string>,
  customLines: string[],
  onRefresh: () => void,
): void {
  const ordered = SPECIALTY_MOTIF_ORDERED_LABELS.filter((l) => presetSelected.has(l));
  const customs = customLines.map((s) => s.trim()).filter((s) => s.length > 0);
  setAt(state, path, [...ordered, ...customs]);
  onRefresh();
}

/** Cases à cocher par section + zone libre pour motifs hors liste. */
function specialtiesMotifsCheckboxPanel(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
): HTMLElement {
  const root = el("div", "space-y-6");

  const customTa = el("textarea", `${FORM_CONTROL_CLASS} min-h-20 resize-y`) as HTMLTextAreaElement;
  customTa.rows = 3;
  customTa.placeholder = "Une ligne = une entrée";
  customTa.value = readCustomSpecialtyLines(path, state).join("\n");

  for (const section of SPECIALTY_MOTIF_SECTIONS) {
    const block = el("div", "space-y-2");
    block.appendChild(el("p", "text-sm font-semibold text-fg", undefined, [section.title]));
    const grid = el("div", "grid gap-1 sm:grid-cols-2");
    for (const label of section.items) {
      const row = el("label", FORM_SPECIALTY_MOTIF_CHECK_CLASS);
      const inp = el(
        "input",
        "mt-0.5 size-4 shrink-0 rounded border-muted/40 accent-primary",
      ) as HTMLInputElement;
      inp.type = "checkbox";
      inp.checked = readPresetSpecialtyMotifSelection(path, state).has(label);
      inp.addEventListener("change", () => {
        const s = readPresetSpecialtyMotifSelection(path, state);
        if (inp.checked) s.add(label);
        else s.delete(label);
        const raw = customTa.value
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        writePracticeSpecialtiesFromForm(state, path, s, raw, onRefresh);
        inp.checked = s.has(label);
      });
      row.appendChild(inp);
      row.appendChild(document.createTextNode(label));
      grid.appendChild(row);
    }
    block.appendChild(grid);
    root.appendChild(block);
  }

  const customWrap = el("div", "space-y-1 border-t border-muted/20 pt-4");
  customWrap.appendChild(
    el("p", "text-sm font-semibold text-fg", undefined, ["Autres motifs (hors liste, optionnel)"]),
  );
  const syncCustom = () => {
    const raw = customTa.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const preset = readPresetSpecialtyMotifSelection(path, state);
    writePracticeSpecialtiesFromForm(state, path, preset, raw, onRefresh);
  };
  customTa.addEventListener("input", syncCustom);
  customTa.addEventListener("change", syncCustom);
  customWrap.appendChild(customTa);
  root.appendChild(customWrap);

  attachClientConfigPath(root, path);
  return root;
}

const PAYMENT_METHOD_PRESETS = [
  { value: "CB", label: "CB" },
  { value: "Virement", label: "Virement" },
  { value: "Chèque", label: "Chèque" },
  { value: "Espèces", label: "Espèces" },
] as const;

const PAYMENT_PRESET_ID_SET = new Set<string>(PAYMENT_METHOD_PRESETS.map((o) => o.value));

const UI_KEY_PAYMENT_AUTRE = "pricingPaymentAutreExpanded";

function readPaymentParts(state: Record<string, unknown>): { presets: Set<string>; other: string } {
  const cur = getAt(state, "pricing.payment");
  const arr = Array.isArray(cur) ? (cur as unknown[]) : [];
  const presets = new Set<string>();
  const others: string[] = [];
  for (const raw of arr) {
    if (typeof raw !== "string") continue;
    const t = raw.trim();
    if (!t) continue;
    if (PAYMENT_PRESET_ID_SET.has(t)) presets.add(t);
    else others.push(t);
  }
  return { presets, other: others.join(", ") };
}

function getPaymentAutreExpanded(state: Record<string, unknown>): boolean {
  const { other } = readPaymentParts(state);
  const ui = state.__ui;
  if (ui && typeof ui === "object" && !Array.isArray(ui)) {
    const v = (ui as Record<string, unknown>)[UI_KEY_PAYMENT_AUTRE];
    if (typeof v === "boolean") return v;
  }
  return other.length > 0;
}

function setPaymentAutreExpanded(state: Record<string, unknown>, expanded: boolean): void {
  ensureRecord("__ui", state);
  (state.__ui as Record<string, unknown>)[UI_KEY_PAYMENT_AUTRE] = expanded;
}

function writePricingPaymentArray(
  state: Record<string, unknown>,
  presets: Set<string>,
  other: string,
): void {
  const includeOther = getPaymentAutreExpanded(state);
  const ordered: string[] = [];
  for (const o of PAYMENT_METHOD_PRESETS) {
    if (presets.has(o.value)) ordered.push(o.value);
  }
  if (includeOther) {
    const t = other.trim();
    if (t) ordered.push(t);
  }
  setAt(state, "pricing.payment", ordered);
}

function paymentMethodsCheckboxGroup(
  state: Record<string, unknown>,
  rerender: () => void,
): HTMLElement {
  const root = el("div", "space-y-2");
  attachClientConfigPath(root, "pricing.payment");
  const { presets, other } = readPaymentParts(state);
  const autreExpanded = getPaymentAutreExpanded(state);

  for (const opt of PAYMENT_METHOD_PRESETS) {
    const row = el("label", FORM_CHECK_LABEL_CLASS);
    const inp = el("input", "size-4 rounded border-muted/40") as HTMLInputElement;
    inp.type = "checkbox";
    inp.checked = presets.has(opt.value);
    inp.addEventListener("change", () => {
      const { presets: p, other: o } = readPaymentParts(state);
      if (inp.checked) p.add(opt.value);
      else p.delete(opt.value);
      writePricingPaymentArray(state, p, o);
      rerender();
    });
    row.appendChild(inp);
    row.appendChild(document.createTextNode(opt.label));
    root.appendChild(row);
  }

  const autreBlock = el("div", "space-y-2");
  const autreRow = el("label", FORM_CHECK_LABEL_CLASS);
  const autreInp = el(
    "input",
    "mt-0.5 size-4 shrink-0 rounded border-muted/40 accent-primary",
  ) as HTMLInputElement;
  autreInp.type = "checkbox";
  autreInp.checked = autreExpanded;
  const otherWrap = el("div", "ml-6 space-y-1.5");
  otherWrap.classList.toggle("hidden", !autreExpanded);
  const otherField = el("input", FORM_CONTROL_CLASS) as HTMLInputElement;
  otherField.type = "text";
  otherField.placeholder = "Ex. lien de paiement, titre espèce…";
  otherField.value = other;
  otherField.addEventListener("input", () => {
    const { presets: p } = readPaymentParts(state);
    writePricingPaymentArray(state, p, otherField.value);
  });
  attachClientConfigPath(otherField, "pricing.payment");

  autreInp.addEventListener("change", () => {
    if (autreInp.checked) {
      setPaymentAutreExpanded(state, true);
      const { presets: p, other: o } = readPaymentParts(state);
      writePricingPaymentArray(state, p, o);
    } else {
      setPaymentAutreExpanded(state, false);
      const { presets: p } = readPaymentParts(state);
      writePricingPaymentArray(state, p, "");
    }
    rerender();
  });

  autreRow.appendChild(autreInp);
  autreRow.appendChild(document.createTextNode("Autre, préciser"));
  autreBlock.appendChild(autreRow);
  otherWrap.appendChild(fieldWrap("Texte affiché sur la page Tarifs", otherField));
  autreBlock.appendChild(otherWrap);
  root.appendChild(autreBlock);

  return root;
}

function linesTextarea(
  state: Record<string, unknown>,
  path: string,
  onRefresh: () => void,
  rows = 5,
): HTMLTextAreaElement {
  const ta = el("textarea", `${FORM_CONTROL_CLASS} min-h-24 resize-y`) as HTMLTextAreaElement;
  ta.rows = rows;
  const cur = getAt(state, path);
  const lines = Array.isArray(cur) ? (cur as string[]).join("\n") : "";
  ta.value = lines;
  const sync = () => {
    const arr = ta.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setAt(state, path, arr);
    onRefresh();
  };
  ta.addEventListener("input", sync);
  ta.addEventListener("change", sync);
  attachClientConfigPath(ta, path);
  return ta;
}

/** Envoi du JSON par e-mail via [Web3Forms](https://web3forms.com) (POST depuis le navigateur, sans serveur). */
export type ClientConfigWeb3FormsOptions = {
  accessKey: string;
};

export function mountClientConfigForm(
  root: HTMLElement,
  initial: Record<string, unknown>,
  options?: { web3forms?: ClientConfigWeb3FormsOptions },
): void {
  const state = migrateClientConfig(deepClone(initial)) as Record<string, unknown>;
  mergePracticePageEnabledDefaults(state);
  ensureRecord("business", state);
  ensureRecord("seo", state);
  ensureRecord("practice", state);
  ensureRecord("credentials", state);
  ensureRecord("conditions", state);
  ensureRecord("contact", state);
  ensureRecord("pricing", state);
  ensureArray("pricing.items", state);
  ensureRecord("aboutPage", state);
  ensureRecord("social", state);
  ensureArray("social.links", state);
  ensureRecord("practicePageEnabled", state);
  ensureRecord("practiceOfferCustomApproaches", state);
  mergePracticeOfferCustomApproachesDefaults(state);
  normalizeContactHoursInFormState(state);

  let activeTab: TabId = "business";
  const errorBox = el(
    "div",
    "mb-6 hidden rounded-2xl border border-red-600/30 bg-red-50 p-5 text-sm text-fg shadow-sm",
  );
  const tabNav = el("nav", "flex gap-2 overflow-x-auto pb-1", {
    "aria-label": "Sections du questionnaire",
  });
  const tabPanel = el("div", "min-h-96 py-6");
  const stepNav = el("div", "mb-2 flex flex-wrap items-center justify-between gap-3");

  function showErrors(issues: ClientValidationIssue[]): void {
    clearClientConfigFieldHighlights(root);
    const firstTab = issues.find((i) => i.tabId != null)?.tabId;
    if (firstTab != null && firstTab !== activeTab) {
      activeTab = firstTab;
      renderTabNav();
      renderTabPanel();
      renderStepNav();
    }
    errorBox.classList.remove("hidden");
    errorBox.replaceChildren();
    errorBox.appendChild(
      el("p", "mb-1 font-semibold text-red-800", undefined, [
        `${issues.length} erreur${issues.length > 1 ? "s" : ""} à corriger`,
      ]),
    );
    errorBox.appendChild(
      el("p", "mb-4 text-sm text-red-800/80", undefined, [
        "Les champs concernés sont surlignés. Ouvrez l’onglet indiqué pour les corriger.",
      ]),
    );
    const ul = el("ul", "space-y-2");
    for (const i of issues) {
      const li = el("li", "rounded-xl border border-red-200 bg-bg px-3.5 py-2.5");
      li.appendChild(el("p", "text-sm leading-snug text-fg", undefined, [i.summary]));
      ul.appendChild(li);
    }
    errorBox.appendChild(ul);
    const paths = [...new Set(issues.map((x) => x.path).filter((p) => p !== "root"))];
    highlightClientConfigFieldsForPaths(tabPanel, paths);
    requestAnimationFrame(() => {
      tabPanel.querySelector(`.${CLIENT_CONFIG_FIELD_INVALID_CLASS}`)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  }

  function clearErrors(): void {
    errorBox.classList.add("hidden");
    errorBox.replaceChildren();
    clearClientConfigFieldHighlights(root);
  }

  function setActiveTab(id: TabId): void {
    activeTab = id;
    renderTabNav();
    renderTabPanel();
    renderStepNav();
    tabPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function renderTabNav(): void {
    tabNav.replaceChildren();
    TABS.forEach((t, index) => {
      const active = activeTab === t.id;
      const btn = el(
        "button",
        `inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${
          active
            ? "border-primary/40 bg-primary text-white shadow-sm"
            : "border-muted/25 bg-bg text-muted hover:border-muted/40 hover:bg-accent/50 hover:text-fg"
        }`,
        { type: "button", "aria-current": active ? "step" : "false" },
      );
      btn.appendChild(
        el(
          "span",
          `flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            active ? "bg-white/20 text-white" : "bg-accent text-muted"
          }`,
          undefined,
          [String(index + 1)],
        ),
      );
      btn.appendChild(el("span", "font-medium", undefined, [t.label]));
      btn.addEventListener("click", () => setActiveTab(t.id));
      tabNav.appendChild(btn);
    });
  }

  function renderStepNav(): void {
    stepNav.replaceChildren();
    const idx = TABS.findIndex((t) => t.id === activeTab);
    const prev = idx > 0 ? TABS[idx - 1] : null;
    const next = idx >= 0 && idx < TABS.length - 1 ? TABS[idx + 1] : null;

    const left = el("div", "");
    if (prev) {
      const b = el(
        "button",
        "rounded-xl border border-muted/25 bg-bg px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-accent/50",
        { type: "button" },
        [`← ${prev.label}`],
      );
      b.addEventListener("click", () => setActiveTab(prev.id));
      left.appendChild(b);
    }
    stepNav.appendChild(left);

    stepNav.appendChild(
      el("p", "text-sm text-muted", undefined, [`Étape ${idx + 1} sur ${TABS.length}`]),
    );

    const right = el("div", "");
    if (next) {
      const b = el(
        "button",
        "rounded-xl border border-muted/25 bg-bg px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-accent/50",
        { type: "button" },
        [`${next.label} →`],
      );
      b.addEventListener("click", () => setActiveTab(next.id));
      right.appendChild(b);
    }
    stepNav.appendChild(right);
  }

  function renderTabPanel(): void {
    tabPanel.replaceChildren();
    const inner = renderActivePanel();
    tabPanel.appendChild(inner);
  }

  function onRefresh(): void {
    /* champs simples : pas de re-render complet */
  }

  function renderActivePanel(): HTMLElement {
    const box = el("div", "max-w-4xl space-y-5");
    switch (activeTab) {
      case "business":
        return renderBusiness(box, state, onRefresh, () => {
          renderTabPanel();
        });
      case "practice":
        return renderPractice(box, state, onRefresh);
      case "optional":
        return renderOptional(box, state, onRefresh, () => {
          renderTabPanel();
        });
      case "cabinet":
        return renderCabinet(box, state, () => {
          renderTabPanel();
        });
      default: {
        const _e: never = activeTab;
        return _e;
      }
    }
  }

  const toolbar = el(
    "div",
    "fixed inset-x-0 bottom-0 z-40 border-t border-muted/20 bg-bg/95 backdrop-blur",
  );
  const toolbarInner = el(
    "div",
    "site-container flex flex-wrap items-center justify-between gap-3 py-3",
  );
  const toolbarHint = el("p", "hidden text-sm text-muted sm:block", undefined, [
    "Envoyez vos réponses une fois le formulaire terminé.",
  ]);
  const toolbarActions = el("div", "flex flex-wrap items-center gap-2");
  const btnDl = el(
    "button",
    "rounded-xl border border-muted/25 bg-bg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-accent/50 hover:text-fg",
    { type: "button" },
    ["Télécharger une copie"],
  );
  const web3 = options?.web3forms;
  const btnMail =
    web3 && web3.accessKey
      ? el(
          "button",
          "rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90",
          { type: "button" },
          ["Envoyer mes réponses"],
        )
      : null;

  btnDl.addEventListener("click", () => {
    mergePracticePageEnabledDefaults(state);
    mergePracticeOfferCustomApproachesDefaults(state);
    const r = validateClientJsonRaw(state);
    if (!r.ok) {
      showErrors(r.issues);
      alert("Corrigez les erreurs avant de télécharger.");
      return;
    }
    clearErrors();
    const blob = new Blob([JSON.stringify(r.data, null, 4)], {
      type: "application/json;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reponses-site.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  if (btnMail && web3) {
    btnMail.addEventListener("click", async () => {
      mergePracticePageEnabledDefaults(state);
      mergePracticeOfferCustomApproachesDefaults(state);
      const r = validateClientJsonRaw(state);
      if (!r.ok) {
        showErrors(r.issues);
        alert("Corrigez les erreurs avant l’envoi.");
        return;
      }
      clearErrors();
      btnMail.disabled = true;
      try {
        const jsonText = JSON.stringify(r.data, null, 4);
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: web3.accessKey,
            subject: `Réponses questionnaire site — ${new Date().toISOString()}`,
            from_name: "Questionnaire contenu du site",
            message: `Contenu du fichier client.json à copier dans src/data/client.json :\n\n${jsonText}`,
          }),
        });
        const data = (await res.json()) as { success?: boolean; message?: string };
        if (!res.ok || !data.success) {
          alert(
            `L’envoi a échoué : ${data.message ?? res.statusText}. Utilisez « Télécharger une copie » et renvoyez le fichier, ou réessayez.`,
          );
          return;
        }
        alert("Réponses envoyées. Merci !");
      } catch {
        alert("Erreur réseau. Utilisez « Télécharger une copie » et renvoyez le fichier.");
      } finally {
        btnMail.disabled = false;
      }
    });
  }

  if (btnMail) {
    toolbarActions.appendChild(btnMail);
  }
  toolbarActions.appendChild(btnDl);
  toolbarInner.appendChild(toolbarHint);
  toolbarInner.appendChild(toolbarActions);
  toolbar.appendChild(toolbarInner);

  const introNotice = el("div", "mb-6 space-y-3");
  const exampleWarning = el(
    "div",
    "rounded-2xl border border-amber-400/40 bg-amber-50/70 px-5 py-4",
  );
  exampleWarning.appendChild(
    el("p", "mb-1 text-sm font-semibold text-amber-900", undefined, [
      "Important : les champs déjà remplis contiennent des informations d'exemple.",
    ]),
  );
  exampleWarning.appendChild(
    el("p", "text-sm leading-relaxed text-amber-800", undefined, [
      "Remplacez-les par vos propres informations, ou effacez-les si elles ne vous concernent pas. Vérifiez l'ensemble du formulaire avant l'envoi.",
    ]),
  );
  introNotice.appendChild(exampleWarning);
  introNotice.appendChild(
    el("p", "text-sm leading-relaxed text-muted", undefined, [
      "Complétez chaque onglet, puis cliquez sur \u00ab Envoyer mes réponses \u00bb une fois le formulaire terminé.",
    ]),
  );

  const tabsShell = el(
    "div",
    "mb-2 space-y-3 rounded-2xl border border-muted/20 bg-accent/30 p-3 md:p-4",
  );
  tabsShell.appendChild(tabNav);

  root.appendChild(introNotice);
  root.appendChild(errorBox);
  root.appendChild(tabsShell);
  root.appendChild(tabPanel);
  root.appendChild(stepNav);
  root.appendChild(toolbar);

  renderTabNav();
  renderTabPanel();
  renderStepNav();
}

function renderBusiness(
  box: HTMLElement,
  state: Record<string, unknown>,
  onRefresh: () => void,
  rerender: () => void,
): HTMLElement {
  const p = "business";
  ensureRecord("credentials", state);
  ensureRecord("credentials.license", state);
  ensureRecord("aboutPage", state);

  const professionPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  professionPanel.appendChild(
    fieldWrap(
      "Métier exercé",
      selectLabeled(state, "profession", PROFESSION_FORM_OPTIONS, () => {
        if (getAt(state, "profession") === "psychomotricien") {
          setAt(state, "practice.reimbursement.monSoutienPsy.enabled", false);
        }
        onRefresh();
        rerender();
      }),
    ),
  );
  box.appendChild(professionPanel);

  const identityPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  identityPanel.appendChild(fieldWrap("Nom complet", textInput(state, `${p}.fullName`, onRefresh)));
  identityPanel.appendChild(
    fieldWrap(
      "Présentation (page À propos)",
      textareaInput(state, "aboutPage.intro", onRefresh, 8),
    ),
  );
  identityPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Amorces utiles : qui vous êtes · pour qui vous travaillez · comment vous accompagnez. Une photo professionnelle (portrait.webp) pourra être ajoutée ensuite par l’intégrateur.",
    ]),
  );
  identityPanel.appendChild(
    fieldWrap(
      "Résumé court (encart latéral, optionnel)",
      textareaInput(state, "aboutPage.sidebarSummary", onRefresh, 3),
    ),
  );
  identityPanel.appendChild(
    desktopFieldGrid(
      2,
      fieldWrap("Titre professionnel", textInput(state, `${p}.title`, onRefresh)),
      fieldWrap("Email professionnel", textInput(state, `${p}.email`, onRefresh)),
    ),
  );
  const regNumberLabel = el("label", FORM_LABEL_CLASS);
  const syncRegNumberLabel = () => {
    regNumberLabel.textContent =
      getAt(state, "credentials.license.registrationLabel") === "rpps" ? "N° RPPS" : "N° ADELI";
  };
  syncRegNumberLabel();
  identityPanel.appendChild(
    registrationLabelRadioGroup(
      state,
      "credentials.license.registrationLabel",
      onRefresh,
      syncRegNumberLabel,
    ),
  );
  const rppsOrAdeliPending = Boolean(getAt(state, "credentials.license.rppsOrAdeliPending"));
  const onRppsOrAdeliPendingChange = () => {
    if (getAt(state, "credentials.license.rppsOrAdeliPending")) {
      setAt(state, "credentials.license.rppsOrAdeli", "");
    }
    rerender();
  };
  const regNumBlock = el("div", "space-y-1.5");
  regNumBlock.appendChild(regNumberLabel);
  regNumBlock.appendChild(
    textInput(state, "credentials.license.rppsOrAdeli", onRefresh, {
      disabled: rppsOrAdeliPending,
    }),
  );
  regNumBlock.appendChild(
    checkboxInput(
      state,
      "credentials.license.rppsOrAdeliPending",
      onRppsOrAdeliPendingChange,
      "Je n’ai pas encore de numéro ADELI/RPPS",
    ),
  );

  const siretPending = Boolean(getAt(state, `${p}.siretPending`));
  const onSiretPendingChange = () => {
    if (getAt(state, `${p}.siretPending`)) {
      setAt(state, `${p}.siret`, "");
    }
    rerender();
  };
  const siretBlock = fieldWrap(
    "N° SIRET",
    textInput(state, `${p}.siret`, onRefresh, { disabled: siretPending }),
  );
  siretBlock.appendChild(
    checkboxInput(
      state,
      `${p}.siretPending`,
      onSiretPendingChange,
      "Je n’ai pas encore de numéro SIRET",
    ),
  );

  identityPanel.appendChild(desktopFieldGrid(2, regNumBlock, siretBlock));
  box.appendChild(identityPanel);

  const addressPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  addressPanel.appendChild(sectionHeading("Adresse et téléphone"));
  addressPanel.appendChild(
    desktopFieldGrid(
      2,
      fieldWrap("Ville", textInput(state, `${p}.city`, onRefresh)),
      fieldWrap("Code postal", textInput(state, `${p}.postalCode`, onRefresh)),
    ),
  );
  addressPanel.appendChild(fieldWrap("Adresse", textInput(state, `${p}.addressLine1`, onRefresh)));
  addressPanel.appendChild(
    fieldWrap(
      "Complément d’adresse (optionnel)",
      textInput(state, `${p}.addressLine2`, onRefresh, "Bâtiment, étage, digicode…"),
    ),
  );
  addressPanel.appendChild(fieldWrap("Téléphone", textInput(state, `${p}.phone`, onRefresh)));
  addressPanel.appendChild(
    fieldWrap(
      "Années d’expérience (optionnel)",
      numberInput(state, "credentials.experienceYears", onRefresh, 0, 80),
    ),
  );
  box.appendChild(addressPanel);

  const degreesPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  degreesPanel.appendChild(sectionHeading("Diplômes"));
  degreesPanel.appendChild(
    renderCredList(state, "credentials.degrees", rerender, {
      addLabel: "+ Ajouter un diplôme",
      fields: [
        { key: "label", label: "Intitulé du diplôme" },
        { key: "institution", label: "Établissement (optionnel)" },
        { key: "year", label: "Année (optionnel)" },
      ],
      defaultNew: { label: "Nouveau diplôme", institution: "", year: "" },
    }),
  );
  box.appendChild(degreesPanel);

  const trainingsPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  trainingsPanel.appendChild(sectionHeading("Formations continues"));
  trainingsPanel.appendChild(
    renderCredList(state, "credentials.trainings", rerender, {
      addLabel: "+ Ajouter une formation",
      fields: [
        { key: "label", label: "Intitulé de la formation" },
        { key: "provider", label: "Organisme (optionnel)" },
        { key: "year", label: "Année (optionnel)" },
      ],
      defaultNew: { label: "Nouvelle formation", provider: "", year: "" },
    }),
  );
  box.appendChild(trainingsPanel);

  const affiliationsPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  affiliationsPanel.appendChild(sectionHeading("Affiliations professionnelles (une par ligne)"));
  affiliationsPanel.appendChild(linesTextarea(state, "credentials.affiliations", onRefresh, 4));
  box.appendChild(affiliationsPanel);

  ensureRecord("social", state);
  ensureArray("social.links", state);
  const socialPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  socialPanel.appendChild(sectionHeading("Réseaux sociaux (optionnel)"));
  socialPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Un ou deux liens suffisent (ex. LinkedIn). Affichés en pied de page.",
    ]),
  );
  socialPanel.appendChild(
    renderCredList(state, "social.links", rerender, {
      addLabel: "+ Ajouter un lien",
      fields: [
        { key: "label", label: "Libellé" },
        { key: "href", label: "URL" },
      ],
      defaultNew: { label: "LinkedIn", href: "https://www.linkedin.com/in/" },
    }),
  );
  box.appendChild(socialPanel);

  return box;
}

function renderPractice(
  box: HTMLElement,
  state: Record<string, unknown>,
  onRefresh: () => void,
): HTMLElement {
  const p = "practice";
  const audiencePanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  audiencePanel.appendChild(
    fieldWrap(
      "Public accompagné",
      audienceCheckboxGroup(state, `${p}.audience`, `${p}.audienceOther`, onRefresh),
    ),
  );
  box.appendChild(audiencePanel);

  const specialtiesPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  specialtiesPanel.appendChild(
    el("label", FORM_LABEL_CLASS, undefined, ["Spécialités ou motifs fréquents"]),
  );
  specialtiesPanel.appendChild(
    specialtiesMotifsCheckboxPanel(state, `${p}.specialties`, onRefresh),
  );
  box.appendChild(specialtiesPanel);

  const languagesPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  languagesPanel.appendChild(
    fieldWrap(
      "Langues parlées en consultation (une par ligne)",
      linesTextarea(state, `${p}.languages`, onRefresh),
    ),
  );
  languagesPanel.appendChild(
    fieldWrap(
      "Modes de consultation",
      consultationModesCheckboxGroup(state, `${p}.consultationModes`, onRefresh),
    ),
  );
  box.appendChild(languagesPanel);

  const waitingPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  waitingPanel.appendChild(sectionHeading("Délais / liste d’attente (optionnel)"));
  waitingPanel.appendChild(
    fieldWrap(
      "Phrase affichée sur la page contact",
      textareaInput(state, `${p}.waitingListNote`, onRefresh, 3),
    ),
  );
  waitingPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Ex. « Les délais varient selon la période ; contactez-moi pour connaître les disponibilités. »",
    ]),
  );
  box.appendChild(waitingPanel);

  const showMonSoutienPsy = getAt(state, "profession") === "psychologue";
  if (showMonSoutienPsy) {
    const reimbursementPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
    reimbursementPanel.appendChild(sectionHeading("Remboursement"));
    reimbursementPanel.appendChild(
      checkboxInput(
        state,
        `${p}.reimbursement.monSoutienPsy.enabled`,
        onRefresh,
        "Proposer le dispositif « Mon soutien psy »",
      ),
    );
    reimbursementPanel.appendChild(
      fieldWrap(
        "Texte affiché aux patients (optionnel)",
        textareaInput(state, `${p}.reimbursement.monSoutienPsy.note`, onRefresh),
      ),
    );
    box.appendChild(reimbursementPanel);
  }
  return box;
}

function renderOptionalFamilyOtherList(
  state: Record<string, unknown>,
  familyId: string,
  rerender: () => void,
): HTMLElement {
  const basePath = `practiceOfferCustomApproaches.${familyId}`;
  const arr = ensureArray(basePath, state) as string[];
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "string") arr[i] = arr[i] == null ? "" : String(arr[i]);
  }

  const wrap = el("div", "space-y-2");
  const add = el("button", FORM_BTN_SECONDARY_CLASS, { type: "button" }, ["Ajouter"]);
  add.addEventListener("click", () => {
    arr.push("");
    rerender();
  });
  wrap.appendChild(add);

  arr.forEach((_, i) => {
    const row = el("div", "flex flex-wrap items-center gap-2");
    const inp = textInput(state, `${basePath}.${i}`, () => {}, {
      placeholder: "Approche ou précision",
      textClass: PRACTICE_OFFER_FORM_TEXT_CLASS,
    });
    inp.classList.add("min-w-0", "flex-1");
    row.appendChild(inp);
    const rm = el("button", `shrink-0 ${FORM_BTN_DANGER_CLASS}`, { type: "button" }, ["Retirer"]);
    rm.addEventListener("click", () => {
      arr.splice(i, 1);
      rerender();
    });
    row.appendChild(rm);
    wrap.appendChild(row);
  });

  return wrap;
}

function renderOptional(
  box: HTMLElement,
  state: Record<string, unknown>,
  onRefresh: () => void,
  rerender: () => void,
): HTMLElement {
  const pageById = new Map(REGISTERED_PRACTICE_PAGES.map((t) => [t.id, t] as const));
  for (const family of PRACTICE_OFFER_FORM_FAMILIES) {
    const practicePagesInFamily = family.practicePageIds
      .map((id) => pageById.get(id))
      .filter((t): t is NonNullable<typeof t> => t != null)
      .sort((a, b) => a.navLabel.localeCompare(b.navLabel, "fr"));
    if (practicePagesInFamily.length === 0) continue;
    const section = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
    section.appendChild(sectionHeading(family.label));
    const grid = el("div", "grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3");
    for (const p of practicePagesInFamily) {
      const cell = el("div", "min-w-0");
      cell.appendChild(
        checkboxInput(
          state,
          `practicePageEnabled.${p.id}`,
          onRefresh,
          p.navLabel,
          PRACTICE_OFFER_FORM_CHECK_CLASS,
        ),
      );
      grid.appendChild(cell);
    }
    section.appendChild(grid);
    const otherWrap = el("div", "mt-8 border-t border-muted/20 pt-6");
    otherWrap.appendChild(
      fieldWrap(
        "Autres approches (optionnel)",
        renderOptionalFamilyOtherList(state, family.id, rerender),
        PRACTICE_OFFER_FORM_LABEL_CLASS,
      ),
    );
    section.appendChild(otherWrap);
    box.appendChild(section);
  }
  return box;
}

type CredListField = { key: string; label: string };

function renderCredList(
  state: Record<string, unknown>,
  basePath: string,
  rerender: () => void,
  opts: {
    addLabel: string;
    fields: CredListField[];
    defaultNew: Record<string, string>;
  },
): HTMLElement {
  const arr = ensureArray(basePath, state) as Record<string, string>[];
  const add = el("button", `mb-2 ${FORM_BTN_SECONDARY_CLASS}`, { type: "button" }, [opts.addLabel]);
  add.addEventListener("click", () => {
    arr.push({ ...opts.defaultNew });
    rerender();
  });
  const wrap = el("div", "space-y-3");
  wrap.appendChild(add);
  arr.forEach((_, i) => {
    const card = el("div", "space-y-3 rounded-xl border border-muted/20 bg-accent/20 p-4");
    const grid = desktopFieldGrid(
      3,
      ...opts.fields.map((f) =>
        fieldWrap(
          f.label,
          textInput(state, `${basePath}.${i}.${f.key}`, () => {}),
        ),
      ),
    );
    card.appendChild(grid);
    const rm = el("button", FORM_BTN_DANGER_CLASS, { type: "button" }, ["Supprimer"]);
    rm.addEventListener("click", () => {
      arr.splice(i, 1);
      rerender();
    });
    card.appendChild(rm);
    wrap.appendChild(card);
  });
  return wrap;
}

function renderCabinet(
  box: HTMLElement,
  state: Record<string, unknown>,
  rerender: () => void,
): HTMLElement {
  normalizeContactHoursInFormState(state);
  ensureRecord("contact.channels", state);
  ensureRecord("conditions", state);
  const condRefresh = () => {
    /* champs simples */
  };

  const hoursPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  hoursPanel.appendChild(sectionHeading("Horaires (par jour)"));
  const hoursGrid = el("div", "grid gap-3 md:grid-cols-2 lg:grid-cols-3");
  for (const day of CONTACT_HOURS_WEEKDAY_ORDER) {
    const dayBox = el("div", "space-y-2 rounded-xl border border-muted/20 bg-accent/20 p-4");
    dayBox.appendChild(
      checkboxInput(
        state,
        `contact.hours.${day}.enabled`,
        rerender,
        CONTACT_HOURS_WEEKDAY_LABELS[day],
      ),
    );
    if (Boolean(getAt(state, `contact.hours.${day}.enabled`))) {
      dayBox.appendChild(
        fieldWrap(
          "Horaires (ex. 9h – 19h)",
          textInput(state, `contact.hours.${day}.value`, () => {}),
        ),
      );
    }
    hoursGrid.appendChild(dayBox);
  }
  hoursPanel.appendChild(hoursGrid);
  box.appendChild(hoursPanel);

  const contactChannelsPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  contactChannelsPanel.appendChild(sectionHeading("Contact en ligne"));
  contactChannelsPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Comment souhaitez-vous être contacté(e) par vos patients ?",
    ]),
  );
  contactChannelsPanel.appendChild(
    fieldWrap(
      "Lien de prise de rendez-vous (Doctolib ou autre)",
      textInput(state, "contact.bookingUrl", condRefresh, "https://www.doctolib.fr/psychologue/…"),
    ),
  );
  contactChannelsPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Utilisé pour le bouton « Prendre rendez-vous ». Obligatoire si le canal Doctolib est coché.",
    ]),
  );
  contactChannelsPanel.appendChild(
    contactChannelsCheckboxGroup(
      state,
      "contact.channels.selected",
      "contact.channels.other",
      "contact.channels.whatsappPhone",
      condRefresh,
    ),
  );
  box.appendChild(contactChannelsPanel);

  const accessPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  accessPanel.appendChild(sectionHeading("Accès au cabinet (optionnel)"));
  accessPanel.appendChild(
    fieldWrap(
      "Comment venir / accessibilité",
      textareaInput(state, "contact.accessNote", condRefresh, 3),
    ),
  );
  accessPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Ex. parking, métro, ascenseur, accès PMR, digicode…",
    ]),
  );
  box.appendChild(accessPanel);

  const c = "conditions";

  const pricingPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  pricingPanel.appendChild(sectionHeading("Tarifs"));
  pricingPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Indiquez vos prestations. Au moins une est nécessaire.",
    ]),
  );
  const items = ensureArray("pricing.items", state) as {
    name?: string;
    price?: number;
    durationMinutes?: number;
    note?: string;
  }[];
  const add = el("button", `mb-4 ${FORM_BTN_SECONDARY_CLASS}`, { type: "button" }, [
    "+ Ajouter une prestation",
  ]);
  add.addEventListener("click", () => {
    items.push({ name: "Nouvelle prestation", price: 60, durationMinutes: 60, note: "" });
    rerender();
  });
  pricingPanel.appendChild(add);
  items.forEach((_, i) => {
    const card = el("div", "space-y-3 rounded-xl border border-muted/20 bg-accent/20 p-4");
    card.appendChild(
      desktopFieldGrid(
        3,
        fieldWrap(
          "Libellé",
          textInput(state, `pricing.items.${i}.name`, () => {}),
        ),
        fieldWrap(
          "Prix (€)",
          numberInput(state, `pricing.items.${i}.price`, () => {}, 0),
        ),
        fieldWrap(
          "Durée (minutes)",
          numberInput(state, `pricing.items.${i}.durationMinutes`, () => {}, 20, 180),
        ),
      ),
    );
    card.appendChild(
      fieldWrap(
        "Précision (optionnel)",
        textInput(state, `pricing.items.${i}.note`, () => {}),
      ),
    );
    const rm = el("button", FORM_BTN_DANGER_CLASS, { type: "button" }, ["Supprimer"]);
    rm.disabled = items.length <= 1;
    rm.title = items.length <= 1 ? "Conservez au moins une prestation." : "";
    rm.addEventListener("click", () => {
      if (items.length <= 1) return;
      items.splice(i, 1);
      rerender();
    });
    card.appendChild(rm);
    pricingPanel.appendChild(card);
  });
  pricingPanel.appendChild(
    fieldWrap(
      "Tarif adapté / situations particulières (optionnel)",
      textareaInput(state, "pricing.reducedRateNote", condRefresh, 2),
    ),
  );
  pricingPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Ex. « Un tarif adapté peut être envisagé pour les étudiants ou selon la situation. »",
    ]),
  );
  box.appendChild(pricingPanel);

  const conditionsPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  conditionsPanel.appendChild(sectionHeading("Annulation"));
  conditionsPanel.appendChild(
    fieldWrap(
      "Délai d’annulation (heures avant la séance)",
      numberInput(state, `${c}.cancellation.noticeHours`, condRefresh, 0, 168),
    ),
  );
  conditionsPanel.appendChild(
    fieldWrap(
      "Politique d’annulation",
      textareaInput(state, `${c}.cancellation.feePolicy`, condRefresh),
    ),
  );
  conditionsPanel.appendChild(sectionHeading("Retard"));
  conditionsPanel.appendChild(
    fieldWrap(
      "Tolérance de retard (minutes)",
      numberInput(state, `${c}.delay.graceMinutes`, condRefresh, 0, 60),
    ),
  );
  conditionsPanel.appendChild(
    fieldWrap("Texte sur le retard", textareaInput(state, `${c}.delay.note`, condRefresh)),
  );
  conditionsPanel.appendChild(sectionHeading("Absence non signalée"));
  conditionsPanel.appendChild(
    checkboxInput(state, `${c}.noShow.charged`, condRefresh, "Facturer l’absence non signalée"),
  );
  conditionsPanel.appendChild(
    fieldWrap("Texte sur l’absence", textareaInput(state, `${c}.noShow.note`, condRefresh)),
  );
  box.appendChild(conditionsPanel);

  const paymentPanel = el("div", `${FORM_SECTION_PANEL_CLASS} space-y-4`);
  paymentPanel.appendChild(sectionHeading("Moyens de paiement acceptés"));
  paymentPanel.appendChild(
    el("p", "text-sm text-muted", undefined, [
      "Cochez au moins un moyen : la page Tarifs l’affiche aux patients.",
    ]),
  );
  paymentPanel.appendChild(paymentMethodsCheckboxGroup(state, rerender));
  box.appendChild(paymentPanel);
  return box;
}
