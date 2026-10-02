/**
 * Constantes non modifiables par le client (liens institutionnels, etc.).
 * Liens déontologie pied de page : {@link professionDeontologieFooterLink} (psychologue uniquement ; absent pour psychomotricien).
 */

/** Hébergeur des sites livrés sur cette stack (mentions légales). */
export const LEGAL_HOSTING_NAME = "Cloudflare, Inc.";
export const LEGAL_HOSTING_ADDRESS = "101 Townsend St, San Francisco, CA 94107, USA";

/** Absence de cookies de mesure ou publicitaires (stack sans tracking). */
export const LEGAL_NO_TRACKING_NOTICE =
  "Ce site n'utilise pas d'outil de mesure d'audience ni de traceurs publicitaires. Aucun bandeau cookies n'est affiché pour ces finalités.";

/** Phrase sur le remboursement mutuelle (non paramétrable par client.json). */
export const REIMBURSEMENT_MUTUELLE_NOTICE =
  "Certaines mutuelles remboursent une partie des séances.";

/** Limites du suivi (liste figée, panneau conditions — non paramétrable par client.json). */
export const CONDITIONS_LIMITS_ITEMS: readonly string[] = [
  "Ce suivi ne remplace pas un service d'urgence.",
  "En cas d'urgence immédiate, contactez le 15 (SAMU) ou le 112.",
];

/**
 * Identifiant du formulaire Formspree (`https://formspree.io/f/<id>`).
 * Renseigné par l’intégrateur dans le code, pas dans client.json.
 */
export const FORMSPREE_FORM_ID = "mlgpkqvl";

/** Libellés et liens CTA pied de page (stack fixe : RDV externe + contact). */
export const SITE_BOOKING_PRIMARY_LABEL = "Prendre rendez-vous";
export const SITE_BOOKING_PRIMARY_HREF = "https://www.doctolib.fr/";
export const SITE_BOOKING_SECONDARY_LABEL = "Me contacter";
export const SITE_BOOKING_SECONDARY_HREF = "/contact/";
