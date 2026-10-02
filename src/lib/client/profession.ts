export const CLIENT_PROFESSIONS = ["psychologue", "psychomotricien"] as const;

export type ClientProfession = (typeof CLIENT_PROFESSIONS)[number];
