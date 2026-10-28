---
version: 1
slug: "interior-pages"
primary_target: "src/layouts/StandardPageLayout.astro"
related_targets: ["src/components/Header.astro", "src/components/pages/AboutPageContent.astro", "src/components/pages/TarifsPageContent.astro", "src/components/pages/PourquoiConsulterPageContent.astro", "src/components/pages/ContactPageContent.astro", "src/styles/interior.css"]
---

# Pages publiques — déclinaison de l’accueil

Modes: Read for profile, practice pages, articles and legal information; Persuade for consultation reasons and pricing; Operate for contact. Scope excludes administration and the client intake tool.

User approved the current homepage and explicitly requested the same visual world, menu and footer throughout the public site. Existing source text, enabled routes, contact channels, prices, qualifications and conditions stay authoritative. No new direction round is needed: this extends the approved system.

## Direction contract

THESIS: Make every public page feel part of the same welcoming practice, with shared navigation and practical next steps.

OWN-WORLD: Inherit DESIGN.md, Manrope, mist and blue-grey ink, lilac and mint panels, flat surfaces, fine rules and modest rounded controls. Header is extracted from the approved homepage; Footer remains the existing shared component.

STORY: Read the practitioner's approach and qualifications; identify a reason to consult; understand fees and conditions; find the actual available contact methods. Preserve existing editorial model text without inventing medical content.

FIRST VIEWPORT: The same compact name-led menu as the homepage, a restrained breadcrumb and a large page heading. Each page immediately exposes its useful content: profile summary, consultation price, consultation reasons or contact channels. Longer text uses narrow reading measures and a practical side rail on wide screens, stacked in DOM order on mobile.

FORM: User-pinned extension of the approved Les perspectives direction (`1cddf575`), code-first. Signature behavior remains native disclosure navigation and readable content; motion only follows existing focus and state vocabulary.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
