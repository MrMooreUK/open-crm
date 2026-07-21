/**
 * Attributes that discourage password managers from treating a form/field
 * as a login or credential save target (1Password, LastPass, Bitwarden, etc.).
 * Spread onto forms and inputs that hold org/contact data, not auth.
 */
export const passwordManagerIgnore = {
  autoComplete: "off",
  "data-1p-ignore": true,
  "data-lpignore": "true",
  "data-bwignore": true,
  "data-form-type": "other",
  "data-protonpass-ignore": true,
} as const;
