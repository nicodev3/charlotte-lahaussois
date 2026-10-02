import { PUBLIC_WEB3FORMS_ACCESS_KEY } from "astro:env/client";
import { mountClientConfigForm } from "./client-config-form.ts";

/**
 * Point d’entrée navigateur pour /client-config/ (bundlé par Astro/Vite).
 */
function bootstrap(): void {
  const holder = document.getElementById("client-config-initial-json");
  const root = document.getElementById("client-config-root");
  if (!root) {
    console.error("[client-config] #client-config-root introuvable");
    return;
  }
  const raw = holder?.textContent?.trim();
  if (!raw) {
    root.innerHTML =
      '<p class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-fg">Données initiales absentes (#client-config-initial-json vide). Rechargez la page ou ouvrez la console (F12).</p>';
    console.error("[client-config] JSON initial vide — vérifier #client-config-initial-json");
    return;
  }
  try {
    const initial = JSON.parse(raw) as Record<string, unknown>;
    const accessKey = PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() ?? "";
    const web3forms = accessKey.length > 0 ? { accessKey } : undefined;
    mountClientConfigForm(root, initial, web3forms ? { web3forms } : undefined);
  } catch (e) {
    console.error("[client-config]", e);
    root.innerHTML = `<p class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-fg">Erreur au chargement : ${String(e)}</p>`;
  }
}

bootstrap();
