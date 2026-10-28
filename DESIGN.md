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

**The One-Family Rule.** Use Manrope across display, prose and controls; hierarchy comes from scale, weight, spacing and contrast.

## Layout

Containers are centered and capped at 77rem. Desktop gutters are 3rem per side, decreasing to 2rem at 1100px, 1.25rem at 640px and 1rem at 360px. The implementation uses asymmetric two-column grids, with 5rem gaps for editorial pairs; these reduce to 3rem and then 2rem as space narrows.

At 900px navigation becomes a compact disclosure. At 640px paired content stacks, actions can fill their container, and reading order remains the DOM order. Large section spacing contracts from 7.5rem to 5rem and then 3.75rem. Dense rows use the smaller spacing steps while major regions retain generous separation. These are responsive patterns, not a requirement that every future page repeat the homepage composition.

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

Desktop navigation uses compact medium-weight text and underline hover. Mobile navigation uses native details/summary, a bordered menu control and an aligned bordered panel. Escape restores focus to the summary; clicking outside closes the menu. The skip link becomes visible on focus.

### Ruled lists and disclosure rows

Content rows use bottom rules, restrained semibold titles and supporting slate prose. FAQ disclosures use native details/summary, a small chevron that rotates when open, and bounded answer text. The disclosure state is immediate, without an entrance animation.

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
