---
name: Charlotte Lahaussois
description: A modern, open and calm visual system in blue-grey, lilac and mint.
colors:
  bg: "#f7f8fa"
  fg: "#243f4a"
  primary: "#2e5654"
  primary-fg: "#ffffff"
  accent: "#eef0f5"
  muted: "#53656f"
  lilac: "#d8d4ec"
  mint: "#c4dcda"
  rule: "#cbd3d8"
  deep: "#213f45"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(3.5rem, 5.6vw, 5.1rem)"
    fontWeight: 500
    lineHeight: 1.055
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 2.875rem)"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  interior-display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(2.5rem, 4.8vw, 4.25rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  interior-headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  interior-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.015em"
  interior-body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.95
  interior-lead:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
  supporting:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.85
  metadata:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
  panel-headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  price:
    fontFamily: "Manrope, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  price-unit:
    fontFamily: "Manrope, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
rounded:
  selection: "0.375rem"
  control: "0.5rem"
  menu: "0.75rem"
  xl: "0.875rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  base: "1rem"
  comfortable: "1.25rem"
  lg: "1.5rem"
  xl: "2rem"
  panel: "2.5rem"
  wide: "3rem"
  column: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "1rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
  button-small:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.control}"
    padding: "0.875rem 1.125rem"
  panel-lilac:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.fg}"
    rounded: "{rounded.xl}"
    padding: "{spacing.panel}"
  panel-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.fg}"
    rounded: "{rounded.xl}"
  selection-active:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.selection}"
    padding: "{spacing.md}"
  field:
    backgroundColor: "{colors.primary-fg}"
    rounded: "{rounded.control}"
---

# Design System: Charlotte Lahaussois

## Overview

**Creative North Star: "Les perspectives"**

A professional, modern and calm world with open space, confident sans-serif typography and gently tinted surfaces. Its dynamism comes from changes in scale, alternating light and dark grounds, and useful state changes rather than decorative activity.

The material remains flat and precise: blue-grey ink, fine rules, restrained corners and clear controls. The visual voice supports an attentive, nonjudgmental tone without becoming ornamental.

**Key Characteristics:**

- Large, lightly weighted headings with generous breathing room.
- Lilac and mint surfaces balanced by deep blue-green ink.
- Quiet, functional motion and visible keyboard states.

## Colors

Cool mist neutrals and muted botanical accents keep contrast clear while softening large surfaces.

### Primary

- **Muted teal** (`primary`): filled actions, emphasized heading text and focus outlines.
- **Deep blue-green** (`deep`): action hover and dark editorial grounds.
- **White** (`primary-fg`): text on filled primary actions and field backgrounds.

### Secondary

- **Soft lilac** (`lilac`): a calm tinted panel ground and text selection.
- **Muted mint** (`mint`): alternate panel state, light accents on dark grounds and closing containers.

### Neutral

- **Mist** (`bg`): primary page ground and selected control surfaces.
- **Blue-grey ink** (`fg`): primary text.
- **Slate** (`muted`): supporting prose and secondary labels.
- **Cool wash** (`accent`): supporting background regions.
- **Quiet rule** (`rule`): one-pixel divisions and field boundaries.

**The Ground-and-Ink Rule.** Keep prose on clearly contrasting grounds; muted colors carry supporting information, while the primary action retains a filled teal treatment.

## Typography

**Display and Body Font:** Manrope, with sans-serif fallback. Astro downloads and self-hosts the declared Latin weights (400, 500, 600, 700), and the base layout preloads the font.

The same family gives headings and practical information a consistent voice. Display and headline roles use medium weight and tightened tracking; controls and compact titles use semibold. The normative ramp is in frontmatter, with responsive display overrides recorded in the sidecar.

Display type is reserved for the strongest invitation. Headlines introduce sections; titles organize rows. Body copy uses relaxed leading, varying from 1.8 to 1.9 by context. Introductory copy is bounded around 39–47 characters; expanded answers allow 65 characters. Supporting rows use smaller text without competing with headings. Numerical facts use tabular figures.

Interior pages extend this ramp with dedicated page display, section headline and semibold row-title roles. Interior reading copy uses the `interior-body` role at a 68–70ch measure; introductory copy uses `interior-lead` at up to 60ch. Notes use `supporting`, while breadcrumbs, qualification years and contact labels use `metadata`. The compact `panel-headline` serves tinted summary panels and long-form subheadings. Fee amounts use the `price` and `price-unit` roles with tabular figures. The sidecar records mobile changes and contextual heading sizes; these roles supplement the approved homepage ramp.

**The One-Family Rule.** Use Manrope across display, prose and controls; hierarchy comes from scale, weight, spacing and contrast.

## Layout

Containers are centered and capped at 77rem. Desktop gutters are 3rem per side, decreasing to 2rem at 1100px, 1.25rem at 640px and 1rem at 360px. The implementation uses asymmetric two-column grids, with 5rem gaps for editorial pairs; these reduce to 3rem and then 2rem as space narrows.

At 900px navigation becomes a compact disclosure. At 640px paired content stacks, actions can fill their container, and reading order remains the DOM order. Large section spacing contracts from 7.5rem to 5rem and then 3.75rem. Dense rows use the smaller spacing steps while major regions retain generous separation. These are responsive patterns, not a requirement that every future page repeat the homepage composition.

Interior editorial pairs use open ruled grids, typically with 5–6rem desktop gaps, contracting to 3rem and 2rem. Reading pages pair flexible prose with a 320px side rail, reduced to 280px at 1100px and 240px at 900px. Contact columns stack at 900px; editorial, qualification, pricing and reading grids stack at 640px. Page titles and leads precede actions in mobile reading order. The shared centered container and its gutters remain authoritative.

## Elevation & Depth

The implemented world uses no box shadows. Depth comes from contrasting grounds, fine dividing rules and a selected light surface inside a translucent control rail. Even the mobile navigation is defined by a border and background rather than a floating shadow.

**The Tonal Depth Rule.** Establish separation through ground, spacing and rules before introducing elevation.

## Shapes

Controls and fields have modest curved corners; large tinted containers use the larger `xl` radius. Selected segments sit within a slightly broader control rail. Rows and full-width dark regions remain square and open. One-pixel boundaries organize information rather than boxing every block. Icons are small line SVGs, with consistent simple strokes and no decorative icon tiles.

## Components

### Buttons and text links

Filled actions are calm and definite. The primary action uses the frontmatter colors and padding, a 56px minimum height, and a small line arrow. Compact navigation actions use a 46px minimum height. Hover deepens the fill over the shared state duration; there is no lift or scale effect. Text links use semibold text, a 44px minimum height and an underline on hover. Keyboard focus uses a three-pixel outline with five-pixel offset; dark grounds switch that outline to mint.

### Tinted containers and segmented controls

Large panels have restrained corners and generous internal padding. A native radio group uses two equal-width segments in a translucent white rail. Selection changes the segment to the mist ground and semibold text; focus remains on the visible segment with a two-pixel outline offset. State changes may update a panel ground from lilac to mint over 400ms, keeping information in place and exposed through a polite live region. Reduced-motion users receive immediate changes.

### Fields

The shared field treatment is white with a quiet one-pixel border and control radius. Carets and focus use the primary teal; placeholders retain the muted text color at full opacity. This build does not establish error or disabled variants.

### Navigation

Desktop navigation uses compact medium-weight text and underline hover. Mobile navigation uses native details/summary, a bordered menu control and an aligned bordered panel. Escape restores focus to the summary; clicking outside closes the menu. The skip link becomes visible on focus. The same extracted header is used throughout the public site; current-page links carry `aria-current="page"` and an underline. The shared footer retains its existing source and appearance.

### Ruled lists and disclosure rows

Content rows use bottom rules, restrained semibold titles and supporting slate prose. FAQ disclosures use native details/summary, a small chevron that rotates when open, and bounded answer text. The disclosure state is immediate, without an entrance animation.

### Interior editorial and qualification rows

Open sections use fine top rules and asymmetric heading/prose columns. Qualifications use two columns of ruled rows, semibold names, muted supporting text and a separate nonshrinking tabular year. On phones the columns stack; no extra card boundary is introduced.

### Fee and hours panels

Fee panels reuse lilac, the large panel radius and panel padding, with a large tabular amount, smaller currency unit and a ruled duration row. Hours panels reuse mint with a full-width collapsed table, semibold day headings, tabular times and fine translucent rules. Both use reduced panel padding on narrow screens. Payment-method labels are static outlined tags, not interactive controls.

### Reading navigation and closing callout

Practice navigation is a lilac side rail with ruled links, at least 56px high; the current link is bold and declared with `aria-current`. It follows the reading column when stacked. Article and legal prose remain bounded, with underlined inline links and tables allowed to scroll horizontally. The shared mint appointment callout reuses the homepage action and phone-link treatments; its actions stack on mobile. Interior FAQs retain the existing native disclosure treatment.

### Optional contact map

The map is loaded on request inside a rounded 300px region. Its trigger exposes loading and disabled states, status text reports unavailable/offline loading, and keyboard focus within the map receives a visible outline. Contact channels remain independently readable and actionable.

## Do's and Don'ts

### Do:

- **Do** reuse the normative frontmatter tokens and the source stylesheet when extending this world.
- **Do** preserve visible focus and native keyboard behavior for interactive controls.
- **Do** keep motion tied to state and honor reduced-motion preferences.
- **Do** let large headings, open space and tonal surfaces establish hierarchy.

### Don't:

- **Don't** replace the established Manrope hierarchy with an unrelated display family.
- **Don't** add routine shadows or hover lifts to the existing flat components.
- **Don't** treat the homepage's section sequence or exact composition as a site-wide template; surface strategy belongs in its surface brief.
