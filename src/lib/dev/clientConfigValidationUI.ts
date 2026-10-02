import { CONTACT_HOURS_WEEKDAY_LABELS, type ContactHoursWeekday } from "../client/contactHours.ts";
import { REGISTERED_PRACTICE_PAGES } from "../practicePageRegistry.ts";

/** Onglets de l’éditeur client.json (alignés sur `client-config-form.ts`). */
export type ClientFormTabId = "business" | "practice" | "optional" | "cabinet";

export const CLIENT_FORM_TAB_LABELS: Record<ClientFormTabId, string> = {
  business: "Vos informations",
  practice: "Votre pratique",
  optional: "Offre de soins",
  cabinet: "Cabinet & tarifs",
};

const HOURS_DAYS = CONTACT_HOURS_WEEKDAY_LABELS as Record<string, string>;

/** Dernière clé non numérique du chemin (ex. `pricing.items.0.name` → `name`). */
function lastSchemaKey(path: string): string {
  const parts = path.split(".");
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]!;
    if (!/^\d+$/.test(p)) return p;
  }
  return path;
}

const KEY_LABELS: Record<string, string> = {
  fullName: "Nom complet",
  title: "Titre professionnel",
  city: "Ville",
  postalCode: "Code postal",
  addressLine1: "Adresse",
  addressLine2: "Complément d’adresse",
  phone: "Téléphone",
  email: "E-mail",
  siret: "Numéro SIRET",
  intro: "Texte de présentation",
  rppsOrAdeli: "Numéro RPPS ou ADELI",
  registrationLabel: "Type d’inscription (ADELI / RPPS)",
  audience: "Public accompagné",
  audienceOther: "Précision du public (champ « Autre »)",
  specialties: "Spécialités ou motifs fréquents",
  languages: "Langues parlées",
  consultationModes: "Modes de consultation",
  waitingListNote: "Délais / liste d’attente",
  bookingUrl: "Lien de prise de rendez-vous",
  accessNote: "Accès au cabinet",
  whatsappPhone: "Numéro WhatsApp",
  reducedRateNote: "Tarif adapté",
  enabled: "Case activée",
  value: "Valeur",
  note: "Texte associé",
  channels: "Canaux de contact",
  selected: "Canaux sélectionnés",
  other: "Précision du canal « Autre »",
  siteName: "Nom du site",
  description: "Description",
  baseUrl: "Adresse du site",
  ogImage: "Image de partage",
  label: "Intitulé",
  institution: "Établissement",
  year: "Année",
  provider: "Organisme",
  name: "Libellé",
  price: "Prix",
  durationMinutes: "Durée (minutes)",
  noticeHours: "Délai d’annulation (heures)",
  feePolicy: "Politique d’annulation",
  graceMinutes: "Tolérance de retard (minutes)",
  charged: "Facturation en cas d’absence",
  schemaVersion: "Version du schéma",
  profession: "Métier exercé",
  items: "Éléments de liste",
  payment: "Moyens de paiement",
  social: "Réseaux sociaux",
  links: "Liens",
  sidebarSummary: "Résumé (encart latéral)",
  href: "Lien",
  experienceYears: "Années d’expérience",
};

/** Libellé de la section racine du schéma (préfixe du chemin d’erreur). */
const SECTION_LABELS: Record<string, string> = {
  business: "Coordonnées",
  credentials: "Diplômes et inscription",
  seo: "Référencement (SEO)",
  conditions: "Conditions d’annulation et séances",
  pricing: "Tarifs",
  contact: "Contact",
  practice: "Pratique",
  aboutPage: "À propos",
  social: "Réseaux sociaux",
};

function weekdayFromPath(path: string): ContactHoursWeekday | null {
  const m = path.match(/contact\.hours\.(\w+)\./);
  if (!m) return null;
  const d = m[1]!;
  return d in HOURS_DAYS ? (d as ContactHoursWeekday) : null;
}

/** Libellé court du champ pour l’affichage des erreurs. */
export function describeClientConfigField(path: string): string {
  if (path === "root") return "Configuration générale";

  const day = weekdayFromPath(path);
  if (day) {
    const base = HOURS_DAYS[day] ?? day;
    const key = lastSchemaKey(path);
    const keyFr = KEY_LABELS[key] ?? key;
    return `${base} — ${keyFr}`;
  }

  if (path.startsWith("practiceOfferCustomApproaches.")) {
    const rest = path.slice("practiceOfferCustomApproaches.".length);
    const [family] = rest.split(".");
    return `Offre de soins — approche complémentaire (${family})`;
  }

  if (path.startsWith("practicePageEnabled.")) {
    const pageId = path.slice("practicePageEnabled.".length);
    const page = REGISTERED_PRACTICE_PAGES.find((entry) => entry.id === pageId);
    return page ? `Offre de soins — ${page.navLabel}` : `Offre de soins — ${pageId}`;
  }

  const key = lastSchemaKey(path);
  if (KEY_LABELS[key]) {
    const prefix = path.split(".")[0]!;
    const prefixFr = SECTION_LABELS[prefix] ?? prefix.charAt(0).toUpperCase() + prefix.slice(1);
    return `${prefixFr} — ${KEY_LABELS[key]}`;
  }

  return path;
}

export function inferClientFormTabForPath(path: string): ClientFormTabId | null {
  if (path === "root") return null;
  if (path === "profession") return "business";
  if (path === "schemaVersion" || path.startsWith("seo.")) {
    return null;
  }
  if (
    path.startsWith("business.") ||
    path.startsWith("credentials.") ||
    path.startsWith("aboutPage.") ||
    path.startsWith("social.")
  ) {
    return "business";
  }
  if (
    path.startsWith("practice.") &&
    !path.startsWith("practicePage") &&
    !path.startsWith("practiceOffer")
  ) {
    return "practice";
  }
  if (
    path.startsWith("practicePageEnabled.") ||
    path.startsWith("practiceOfferCustomApproaches.")
  ) {
    return "optional";
  }
  if (
    path.startsWith("contact.") ||
    path.startsWith("conditions.") ||
    path.startsWith("pricing.")
  ) {
    return "cabinet";
  }
  return null;
}

/**
 * Extrait la longueur minimale attendue depuis les messages Zod (v3 / v4),
 * ex. « Too small: expected string to have >=9 characters ».
 */
function parseZodMinStringLength(message: string): number | null {
  const m = message.trim();
  const patterns = [
    /expected string to have >=\s*(\d+)\s*characters?/i,
    />=\s*(\d+)\s*characters?/i,
    /at least (\d+) characters?/i,
    /String must contain at least (\d+) characters?/i,
    /String to have at least (\d+)/i,
  ];
  for (const re of patterns) {
    const match = m.match(re);
    if (match) return Number(match[1]);
  }
  return null;
}

function parseZodMinArrayLength(message: string): number | null {
  const m = message.trim();
  const patterns = [
    /expected array to have >=\s*(\d+)\s*items?/i,
    /at least (\d+) elements?/i,
    /Array must contain at least (\d+)/i,
  ];
  for (const re of patterns) {
    const match = m.match(re);
    if (match) return Number(match[1]);
  }
  return null;
}

function parseZodMinNumber(message: string): number | null {
  const m = message.trim();
  const match = m.match(/expected number to be >=\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

/** Message français pour une chaîne trop courte (le libellé du champ est déjà dans `summary` côté formulaire). */
function frenchStringTooSmallMessage(path: string, minLen: number): string {
  const key = lastSchemaKey(path);
  if (key === "siret" || path.endsWith(".siret")) {
    return minLen >= 9
      ? "Le numéro SIRET est incomplet : le schéma exige au moins 9 caractères ; en France un SIRET valide comporte 14 chiffres consécutifs, sans espace."
      : `Ce numéro doit comporter au moins ${minLen} caractères.`;
  }
  if (key === "rppsOrAdeli" || path.includes("rppsOrAdeli")) {
    return "Saisissez votre numéro d’inscription (ADELI ou RPPS) : ce champ ne peut pas être vide.";
  }
  if (minLen <= 1) {
    return "Ce champ est obligatoire : saisissez au moins un caractère (il ne peut pas être vide).";
  }
  return `Le texte est trop court : comptez au moins ${minLen} caractères. Complétez ou allongez la saisie.`;
}

function frenchNumberTooSmallMessage(path: string, minVal: number): string {
  const key = lastSchemaKey(path);
  if (key === "price" || path.endsWith(".price")) {
    return `Le prix indiqué est trop bas : la valeur minimale autorisée est ${minVal} (euros).`;
  }
  if (key === "durationMinutes" || path.endsWith(".durationMinutes")) {
    return `La durée en minutes est trop faible : elle doit être au moins ${minVal} (durée d’une séance).`;
  }
  if (key === "noticeHours") {
    return `Le délai d’annulation ne peut pas être inférieur à ${minVal} heure(s).`;
  }
  if (key === "graceMinutes") {
    return `La tolérance de retard doit être d’au moins ${minVal} minute(s).`;
  }
  return `La valeur est trop petite : elle doit être supérieure ou égale à ${minVal}.`;
}

/** Remplace les messages Zod courants par une formulation claire en français. */
export function humanizeClientZodMessage(raw: string, path: string): string {
  let m = raw.trim();

  if (/invalid_url/i.test(m) || m.toLowerCase().includes("invalid url")) {
    return "Indiquez une URL valide (ex. https://…).";
  }
  if (/invalid_string.*email/i.test(m) || m.toLowerCase().includes("email")) {
    return "Indiquez une adresse e-mail valide.";
  }

  const minStr = parseZodMinStringLength(m);
  if (minStr !== null) {
    return frenchStringTooSmallMessage(path, minStr);
  }
  if (/too small/i.test(m) && /string/i.test(m)) {
    return frenchStringTooSmallMessage(path, 1);
  }

  const minArr = parseZodMinArrayLength(m);
  if (minArr !== null) {
    return minArr <= 1
      ? "Cette liste doit contenir au moins un élément."
      : `Cette liste doit contenir au moins ${minArr} éléments.`;
  }
  if (/too small/i.test(m) && /array/i.test(m)) {
    return "Cette liste doit contenir au moins un élément.";
  }

  const minNum = parseZodMinNumber(m);
  if (minNum !== null) {
    return frenchNumberTooSmallMessage(path, minNum);
  }
  if (/too small/i.test(m) && /number/i.test(m)) {
    return frenchNumberTooSmallMessage(path, 0);
  }

  if (/required/i.test(m) || m === "Invalid input: expected string, received undefined") {
    return "Cette valeur est obligatoire.";
  }
  if (m.includes("at least") && m.includes("element") && !m.includes("character")) {
    return "Ajoutez au moins une entrée dans cette liste.";
  }
  if (path.endsWith(".value") && m.includes("required")) {
    return "Renseignez les horaires pour ce jour ou décochez-le.";
  }
  if (
    path === "contact.channels.selected" ||
    (path.includes("FORMSPREE") && m.includes("intégrateur"))
  ) {
    return m;
  }

  if (m.length > 120 && !m.includes(" ")) {
    return "Valeur invalide pour ce champ.";
  }

  return m.endsWith(".") ? m : `${m}.`;
}

export type ClientValidationIssue = {
  path: string;
  /** Message d’origine (Zod ou validation métier). */
  zodMessage: string;
  /** Phrase unique affichée dans la liste d’erreurs. */
  summary: string;
  tabId: ClientFormTabId | null;
  tabLabel: string | null;
};

export function enrichClientValidationIssues(
  issues: { path: string; message: string }[],
): ClientValidationIssue[] {
  return issues.map((i) => {
    const tabId = inferClientFormTabForPath(i.path);
    const tabLabel = tabId ? CLIENT_FORM_TAB_LABELS[tabId] : null;
    const field = describeClientConfigField(i.path);
    const human = humanizeClientZodMessage(i.message, i.path);

    const where =
      tabLabel != null
        ? `Onglet « ${tabLabel} »`
        : i.path === "root"
          ? "Formulaire"
          : "Champ à corriger";

    const summary = `${where} — ${field} : ${human}`;

    return {
      path: i.path,
      zodMessage: i.message,
      summary,
      tabId,
      tabLabel,
    };
  });
}
