import { z } from "zod";
import {
  CONTACT_HOURS_WEEKDAY_LABELS,
  CONTACT_HOURS_WEEKDAY_ORDER,
  emptyContactHours,
} from "./contactHours.ts";
import { PRACTICE_OFFER_FORM_FAMILIES } from "../practiceOfferFormFamilies.ts";
import { REGISTERED_PRACTICE_PAGES } from "../practicePageRegistry.ts";
import { CLIENT_PROFESSIONS } from "./profession.ts";

/** Chaîne optionnelle : clé absente, `null`, `""` ou espaces seuls → valeur absente ; sinon texte non vide (après trim), validé par `inner`. */
function optionalTrimmedString(inner: z.ZodType<string, string>) {
  return (
    z
      .union([z.string(), z.undefined(), z.null()])
      .transform((val) => {
        const t = val?.trim();
        return t ? t : undefined;
      })
      .pipe(z.union([z.undefined(), inner]))
      /** Zod 4 : une propriété d’objet omise est `undefined` et exige `.optional()` au niveau du champ, pas seulement dans l’union. */
      .optional()
  );
}

export function optionalClientString() {
  return optionalTrimmedString(z.string().min(1));
}

/** URL optionnelle (même sémantique que {@link optionalClientString}, avec validation URL). */
export function optionalClientUrl() {
  return optionalTrimmedString(z.url());
}

const practicePageEnabledShape = Object.fromEntries(
  REGISTERED_PRACTICE_PAGES.map(({ id }) => [id, z.boolean().default(false)]),
) as z.ZodRawShape;

/** Une clé par page du registre (`practicePageRegistry.ts`) : `true` = page Markdown activée sur le site. */
export const practicePageEnabledFieldSchema = z.preprocess(
  (val) => (val == null || typeof val !== "object" || Array.isArray(val) ? {} : val),
  z.object(practicePageEnabledShape),
);

const practiceOfferCustomApproachesShape = Object.fromEntries(
  PRACTICE_OFFER_FORM_FAMILIES.map((f) => [f.id, z.array(z.string()).default([])]),
) as z.ZodRawShape;

/** Approches complémentaires (hors cases à cocher), une liste de chaînes par famille du formulaire (`practiceOfferFormFamilies.ts`). */
export const practiceOfferCustomApproachesFieldSchema = z.preprocess(
  (val) => (val == null || typeof val !== "object" || Array.isArray(val) ? {} : val),
  z.object(practiceOfferCustomApproachesShape),
);

const contactDaySlotSchema = z.object({
  enabled: z.boolean().default(false),
  value: z.string().default(""),
});

/** Canaux par lesquels le professionnel accepte d'être contacté par ses patients. */
export const CONTACT_CHANNEL_VALUES = [
  "form",
  "email",
  "whatsapp",
  "phone",
  "doctolib",
  "other",
] as const;

export const ClientSchema = z
  .object({
    schemaVersion: z.literal(25),
    /** Métier exercé : pilote libellés institutionnels, FAQ remboursement, Mon Soutien Psy, etc. */
    profession: z.enum(CLIENT_PROFESSIONS),
    business: z
      .object({
        fullName: z.string().min(1),
        title: z.string().min(1),
        city: z.string().min(1),
        addressLine1: z.string().min(1),
        /** Complément (bâtiment, étage, digicode…) — optionnel. */
        addressLine2: optionalClientString(),
        postalCode: z.string().min(1),
        phone: z.string().min(1),
        email: z.email(),
        siret: optionalClientString(),
        /** Coché lorsque le professionnel n'a pas encore reçu son numéro SIRET (ex. activité en cours de création). */
        siretPending: z.boolean().default(false),
      })
      .superRefine((data, ctx) => {
        if (data.siretPending) return;
        if (!data.siret) {
          ctx.addIssue({
            code: "custom",
            message:
              "Indiquez votre numéro SIRET, ou cochez « Je n’ai pas encore de numéro SIRET ».",
            path: ["siret"],
          });
          return;
        }
        if (data.siret.length < 9) {
          ctx.addIssue({
            code: "custom",
            message: "Le numéro SIRET est incomplet : il doit comporter au moins 9 caractères.",
            path: ["siret"],
          });
        }
      }),
    social: z
      .object({
        links: z
          .array(
            z.object({
              label: z.string().min(1),
              href: z.url(),
            }),
          )
          .default([]),
      })
      .default({ links: [] }),
    practice: z
      .object({
        audience: z
          .array(z.enum(["enfants", "adolescents", "adultes", "couples", "familles", "autre"]))
          .default(["adultes"]),
        audienceOther: z.string().default(""),
        specialties: z.array(z.string().min(1)).default([]),
        /** Valeur lue depuis le JSON avant parse ; après validation, écrasée par les libellés du registre pour chaque entrée `practicePageEnabled` activée. */
        approaches: z.array(z.string().min(1)).default([]),
        languages: z.array(z.string().min(1)).default(["fr"]),
        consultationModes: z.array(z.enum(["cabinet", "visio", "domicile"])).default(["cabinet"]),
        /** Phrase optionnelle sur les délais / liste d’attente (page contact). */
        waitingListNote: optionalClientString(),
        reimbursement: z.object({
          monSoutienPsy: z.object({
            enabled: z.boolean().default(false),
            note: z.string().min(1).default("À vérifier selon votre situation."),
          }),
        }),
      })
      .superRefine((data, ctx) => {
        if (data.audience.includes("autre")) {
          const detail = data.audienceOther.trim();
          if (!detail) {
            ctx.addIssue({
              code: "custom",
              message: "Précisez le public lorsque « Autre » est coché.",
              path: ["audienceOther"],
            });
          }
        }
      })
      .default({
        audience: ["adultes"],
        audienceOther: "",
        specialties: [],
        approaches: [],
        languages: ["fr"],
        consultationModes: ["cabinet"],
        reimbursement: {
          monSoutienPsy: {
            enabled: false,
            note: "À vérifier selon votre situation.",
          },
        },
      }),
    credentials: z
      .object({
        license: z
          .object({
            rppsOrAdeli: optionalClientString(),
            /** Coché lorsque le professionnel n'a pas encore reçu son numéro ADELI/RPPS (ex. inscription en cours). */
            rppsOrAdeliPending: z.boolean().default(false),
            registrationLabel: z.enum(["adeli", "rpps"]).default("adeli"),
          })
          .superRefine((data, ctx) => {
            if (data.rppsOrAdeliPending) return;
            if (!data.rppsOrAdeli) {
              ctx.addIssue({
                code: "custom",
                message:
                  "Saisissez votre numéro d’inscription (ADELI ou RPPS), ou cochez « Je n’ai pas encore ce numéro ».",
                path: ["rppsOrAdeli"],
              });
            }
          }),
        degrees: z
          .array(
            z.object({
              label: z.string().min(1),
              institution: optionalClientString(),
              year: optionalClientString(),
            }),
          )
          .default([]),
        trainings: z
          .array(
            z.object({
              label: z.string().min(1),
              provider: optionalClientString(),
              year: optionalClientString(),
            }),
          )
          .default([]),
        affiliations: z.array(z.string().min(1)).default([]),
        experienceYears: z.number().int().min(0).max(80).optional(),
      })
      .default({
        license: {
          rppsOrAdeliPending: true,
          registrationLabel: "adeli",
        },
        degrees: [],
        trainings: [],
        affiliations: [],
      }),
    conditions: z
      .object({
        cancellation: z.object({
          noticeHours: z.number().int().min(0).max(168).default(24),
          feePolicy: z
            .string()
            .min(1)
            .default("Toute séance annulée hors délai peut être due, sauf cas de force majeure."),
        }),
        delay: z.object({
          graceMinutes: z.number().int().min(0).max(60).default(10),
          note: z
            .string()
            .min(1)
            .default(
              "En cas de retard important, la séance peut être écourtée pour respecter les rendez-vous suivants.",
            ),
        }),
        noShow: z.object({
          charged: z.boolean().default(true),
          note: z
            .string()
            .min(1)
            .default("Toute absence non signalée est considérée comme une séance due."),
        }),
      })
      .default({
        cancellation: {
          noticeHours: 24,
          feePolicy: "Toute séance annulée hors délai peut être due, sauf cas de force majeure.",
        },
        delay: {
          graceMinutes: 10,
          note: "En cas de retard important, la séance peut être écourtée pour respecter les rendez-vous suivants.",
        },
        noShow: {
          charged: true,
          note: "Toute absence non signalée est considérée comme une séance due.",
        },
      }),
    seo: z.object({
      /** Dérivé de `business.fullName`, `profession` et `business.city` lors du parsing. */
      siteName: z.string().min(1).optional(),
      description: z.string().min(1),
      baseUrl: z.url(),
      ogImage: z.url(),
    }),
    practicePageEnabled: practicePageEnabledFieldSchema,
    practiceOfferCustomApproaches: practiceOfferCustomApproachesFieldSchema,
    aboutPage: z
      .object({
        intro: z.string().min(1),
        /** Court texte pour la sidebar. Absent = pas de paragraphe résumé. */
        sidebarSummary: optionalClientString(),
      })
      .default({
        intro:
          "Une présentation de mon parcours et de ma façon d'accompagner les personnes en consultation.",
      }),
    contact: z
      .object({
        hours: z
          .object({
            monday: contactDaySlotSchema,
            tuesday: contactDaySlotSchema,
            wednesday: contactDaySlotSchema,
            thursday: contactDaySlotSchema,
            friday: contactDaySlotSchema,
            saturday: contactDaySlotSchema,
            sunday: contactDaySlotSchema,
          })
          .default(() => emptyContactHours()),
        /** Lien Doctolib (ou autre) pour le CTA « Prendre rendez-vous ». */
        bookingUrl: optionalClientUrl(),
        /** Accès / accessibilité (parking, métro, digicode, PMR…) — texte libre. */
        accessNote: optionalClientString(),
        channels: z
          .object({
            selected: z.array(z.enum(CONTACT_CHANNEL_VALUES)).default(["form", "email", "phone"]),
            /** Précision affichée quand « Autre » est sélectionné. */
            other: optionalClientString(),
            /** Numéro WhatsApp distinct du téléphone affiché (sinon = `business.phone`). */
            whatsappPhone: optionalClientString(),
          })
          .default({ selected: ["form", "email", "phone"] }),
      })
      .superRefine((data, ctx) => {
        for (const day of CONTACT_HOURS_WEEKDAY_ORDER) {
          const slot = data.hours[day];
          if (slot.enabled && slot.value.trim().length === 0) {
            ctx.addIssue({
              code: "custom",
              message: `Indiquez les horaires pour ${CONTACT_HOURS_WEEKDAY_LABELS[day]} ou décochez ce jour.`,
              path: ["hours", day, "value"],
            });
          }
        }
        if (data.channels.selected.includes("other") && !data.channels.other) {
          ctx.addIssue({
            code: "custom",
            message: "Précisez le canal de contact lorsque « Autre » est coché.",
            path: ["channels", "other"],
          });
        }
        if (data.channels.selected.includes("doctolib") && !data.bookingUrl) {
          ctx.addIssue({
            code: "custom",
            message:
              "Indiquez l’URL de votre fiche Doctolib (ou de prise de rendez-vous) lorsque le canal Doctolib est coché.",
            path: ["bookingUrl"],
          });
        }
      }),
    pricing: z.object({
      items: z
        .array(
          z.object({
            name: z.string().min(1),
            price: z.number().min(0),
            durationMinutes: z.number().int().min(20).max(180).default(60),
            note: optionalClientString(),
          }),
        )
        .min(1),
      payment: z.array(z.string().min(1)).default([]),
      /** Note globale sur un tarif adapté (étudiants, situations particulières…). */
      reducedRateNote: optionalClientString(),
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.profession === "psychomotricien" &&
      data.practice.reimbursement.monSoutienPsy.enabled
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Mon Soutien Psy concerne les psychologues : désactivez la prise en charge ou indiquez le métier « psychologue ».",
        path: ["practice", "reimbursement", "monSoutienPsy", "enabled"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    practice: {
      ...data.practice,
      approaches: REGISTERED_PRACTICE_PAGES.filter(
        (t) => data.practicePageEnabled[t.id] === true,
      ).map((t) => t.navLabel),
    },
  }));

export type ClientConfig = z.infer<typeof ClientSchema>;
export type { ClientProfession } from "./profession.ts";
