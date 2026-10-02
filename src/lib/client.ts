import raw from "../data/client.json";
import { parseClientConfig } from "./client/migrations";
import type { ClientConfig } from "./client/schema";

export * from "./client/schema";
export * from "./client/migrations";

/** Contenu client validé (migrations + schéma Zod) — source unique pour tous les composants. */
export const client: ClientConfig = parseClientConfig(raw);
