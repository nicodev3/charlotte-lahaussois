import type { ClientConfig } from "./schema.ts";

/** Sur-titre hero : affiche uniquement les approches. */
export function heroEyebrowTagline(client: ClientConfig): string | null {
  const approaches = client.practice.approaches.map((item) => item.trim()).filter(Boolean);
  return approaches.length > 0 ? approaches.join(", ") : null;
}
