/** Shared attrs so password managers ignore org profile fields. */
export const orgPmIgnore = {
  autoComplete: "off" as const,
  "data-1p-ignore": true,
  "data-lpignore": "true",
  "data-bwignore": true,
  "data-form-type": "other",
  "data-protonpass-ignore": true,
};
