import type { ClientConfig } from "./schema.ts";

/** Numéro français local (`"06 12 34 56 78"`) → identifiant `wa.me` (`"33612345678"`). */
export function toWhatsappDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.startsWith("0") ? `33${digits.slice(1)}` : digits;
}

/** Téléphone WhatsApp (override optionnel) ou téléphone professionnel. */
export function resolvedWhatsappPhone(client: ClientConfig): string {
  const override = client.contact.channels.whatsappPhone?.trim();
  if (override) return override;
  return client.business.phone;
}

export function resolvedWhatsappHref(client: ClientConfig): string {
  return `https://wa.me/${toWhatsappDigits(resolvedWhatsappPhone(client))}`;
}
