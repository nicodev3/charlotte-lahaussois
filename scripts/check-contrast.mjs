/**
 * Vérification des contrastes WCAG 2.1 AA (4.5:1 pour texte normal).
 * À lancer avec : npm run check:contrast [chemin/vers/tokens.css]
 *
 * Lit les tokens `--color-*` (hex ou `rgb()`) du bloc `@theme` de src/styles/global.css.
 * Après application d’un design client, passer src/styles/stitch.css en argument
 * pour vérifier les tokens surchargés (les tokens absents reprennent ceux du socle).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const BASE_TOKENS_PATH = path.resolve(process.cwd(), "src/styles/global.css");
const REQUIRED_TOKENS = ["bg", "fg", "primary", "primary-fg", "accent", "muted"];
const AA_NORMAL = 4.5;

async function readColorTokens(filePath) {
  const css = await readFile(filePath, "utf8");
  const tokens = {};
  for (const match of css.matchAll(/--color-([a-z-]+)\s*:\s*([^;]+);/g)) {
    const rgb = parseColor(match[2].trim());
    if (rgb) tokens[match[1]] = rgb;
  }
  return tokens;
}

/** `#rgb`, `#rrggbb` ou `rgb(r g b)` / `rgb(r, g, b)` → [r, g, b]. */
function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
  }
  const rgb = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}

function srgbToLinear(v) {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function blend(base, over, alpha) {
  return base.map((c, i) => Math.round(c * (1 - alpha) + over[i] * alpha));
}

async function main() {
  const overridePath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : null;
  const theme = {
    ...(await readColorTokens(BASE_TOKENS_PATH)),
    ...(overridePath ? await readColorTokens(overridePath) : {}),
  };

  const missing = REQUIRED_TOKENS.filter((name) => !theme[name]);
  if (missing.length > 0) {
    console.error(`[check:contrast] Tokens manquants ou mal formés : ${missing.join(", ")}`);
    process.exit(1);
  }

  const colors = { ...theme, "primary-20": blend(theme.bg, theme.primary, 0.2) };
  const checks = [
    ["fg sur bg", "fg", "bg"],
    ["muted sur bg", "muted", "bg"],
    ["primary sur bg", "primary", "bg"],
    ["primary-fg sur primary", "primary-fg", "primary"],
    ["fg sur primary/20", "fg", "primary-20"],
  ];

  console.log(`=== Contrastes WCAG 2.1 AA — ${overridePath ?? BASE_TOKENS_PATH} ===\n`);
  let hasFailures = false;
  for (const [name, fg, bg] of checks) {
    const ratio = contrastRatio(colors[fg], colors[bg]);
    const ok = ratio >= AA_NORMAL;
    hasFailures ||= !ok;
    console.log(`  ${ok ? "✓" : "✗"} ${name}: ${ratio.toFixed(2)}:1 (min ${AA_NORMAL})`);
  }

  if (hasFailures) {
    console.log("\n⚠ Des combinaisons ne respectent pas WCAG AA.");
    process.exit(1);
  }
  console.log("\n✓ Tous les contrastes vérifiés respectent WCAG AA.");
}

main().catch((error) => {
  console.error("[check:contrast] Erreur inattendue");
  console.error(error);
  process.exit(1);
});
