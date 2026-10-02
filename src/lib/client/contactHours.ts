/**
 * Horaires d’ouverture par jour de la semaine (contact).
 */

export const CONTACT_HOURS_WEEKDAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type ContactHoursWeekday = (typeof CONTACT_HOURS_WEEKDAY_ORDER)[number];

export type ContactHoursSlot = { enabled: boolean; value: string };

export type ContactHours = Record<ContactHoursWeekday, ContactHoursSlot>;

export const CONTACT_HOURS_WEEKDAY_LABELS: Record<ContactHoursWeekday, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

/** Libellés français normalisés (minuscules, sans accents) → clé. */
export const CONTACT_HOURS_LABEL_TO_KEY: Record<string, ContactHoursWeekday> = {
  lundi: "monday",
  mardi: "tuesday",
  mercredi: "wednesday",
  jeudi: "thursday",
  vendredi: "friday",
  samedi: "saturday",
  dimanche: "sunday",
};

export function normalizeFrenchDayLabel(label: string): string {
  return label.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function emptyContactHours(): ContactHours {
  const o = {} as ContactHours;
  for (const day of CONTACT_HOURS_WEEKDAY_ORDER) {
    o[day] = { enabled: false, value: "" };
  }
  return o;
}

/** Jours activés avec un horaire renseigné, dans l’ordre de la semaine (affichage). */
export function enabledContactHoursRows(
  hours: ContactHours,
): { day: ContactHoursWeekday; label: string; value: string }[] {
  return CONTACT_HOURS_WEEKDAY_ORDER.flatMap((day) => {
    const slot = hours[day];
    const value = slot.value.trim();
    return slot.enabled && value.length > 0
      ? [{ day, label: CONTACT_HOURS_WEEKDAY_LABELS[day], value }]
      : [];
  });
}

/**
 * Ancien format : tableau { label, value }.
 * Nouveau format : objet avec une entrée par jour.
 */
export function coerceContactHours(hours: unknown): ContactHours {
  const base = emptyContactHours();
  if (Array.isArray(hours)) {
    for (const item of hours) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const rec = item as Record<string, unknown>;
      const labelRaw = typeof rec.label === "string" ? rec.label : "";
      const label = normalizeFrenchDayLabel(labelRaw);
      const key = CONTACT_HOURS_LABEL_TO_KEY[label];
      const value = typeof rec.value === "string" ? rec.value.trim() : "";
      if (key && value.length > 0) {
        base[key] = { enabled: true, value };
      }
    }
    return base;
  }
  if (hours && typeof hours === "object" && !Array.isArray(hours)) {
    const h = hours as Record<string, unknown>;
    for (const day of CONTACT_HOURS_WEEKDAY_ORDER) {
      const slot = h[day];
      if (slot && typeof slot === "object" && !Array.isArray(slot)) {
        const s = slot as Record<string, unknown>;
        base[day] = {
          enabled: Boolean(s.enabled),
          value: typeof s.value === "string" ? s.value : "",
        };
      }
    }
  }
  return base;
}
