import { redirect } from "next/navigation";

/** Prefer the docs hub accordion; deep-link to the API section. */
export default function ApiDocsRedirectPage() {
  redirect("/docs?section=api");
}
