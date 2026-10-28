import { SITE_BOOKING_PRIMARY_LABEL, SITE_BOOKING_SECONDARY_HREF } from "../constants.ts";
import type { ClientConfig } from "./schema.ts";

/** URL du praticien ; sans URL vérifiée, le rendez-vous passe par le contact. */
export function resolvedBookingPrimaryHref(client: ClientConfig): string {
  const url = client.contact.bookingUrl?.trim();
  return url && url.length > 0 ? url : SITE_BOOKING_SECONDARY_HREF;
}

export function bookingPrimaryIsExternal(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export { SITE_BOOKING_PRIMARY_LABEL };
