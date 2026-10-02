import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  REGISTERED_PRACTICE_PAGES,
  practicePageContentId,
} from "../src/lib/practicePageRegistry.ts";

const root = dirname(fileURLToPath(import.meta.url));
const dir = join(root, "..", "src", "content", "practice-pages");
mkdirSync(dir, { recursive: true });

for (const t of REGISTERED_PRACTICE_PAGES) {
  const name = practicePageContentId(t.slug);
  const titleEsc = t.navLabel.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const body = `---
title: "${titleEsc}"
description: "Présentation de cette approche — texte à personnaliser."
draft: false
---

## Présentation

Ce contenu est un modèle : adaptez-le à votre pratique et à votre cadre déontologique.

## Pour qui

À compléter selon les indications et contre-indications de votre approche.

## Déroulement

À compléter (durée, objectifs, cadre).
`;
  writeFileSync(join(dir, name), body, "utf8");
}

console.log("wrote", REGISTERED_PRACTICE_PAGES.length, "practice-pages");
