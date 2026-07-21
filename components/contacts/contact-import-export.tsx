"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  importContactsFromForm,
  getContactImportTemplate,
} from "@/lib/actions/contact-io";
import {
  FORMAT_LABELS,
  IMPORT_ACCEPT,
  type ContactIOFormat,
} from "@/lib/contacts/io";
import { Button } from "@/components/ui/button";

const EXPORT_FORMATS: ContactIOFormat[] = [
  "csv",
  "tsv",
  "json",
  "vcf",
  "xlsx",
];

export function ContactImportExport() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput?.files?.[0]) {
      toast.error("Choose a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData(form);
    const result = await importContactsFromForm(formData);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    const parts = [
      `${result.created} imported`,
      result.skipped ? `${result.skipped} skipped` : null,
      result.companiesCreated
        ? `${result.companiesCreated} companies created`
        : null,
    ].filter(Boolean);

    toast.success(`Import complete (${FORMAT_LABELS[result.format]})`, {
      description: parts.join(" · "),
    });

    if (result.errors.length) {
      toast.message("Some rows had issues", {
        description: result.errors.slice(0, 3).join("; "),
      });
    }

    setImportOpen(false);
    setFileName(null);
    form.reset();
    router.refresh();
  }

  function downloadExport(format: ContactIOFormat) {
    setExportOpen(false);
    const a = document.createElement("a");
    a.href = `/api/v1/contacts/export?format=${format}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadTemplate() {
    const csv = await getContactImportTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "open-crm-contacts-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setExportOpen((v) => !v);
            setImportOpen(false);
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        {exportOpen ? (
          <div className="absolute right-0 z-40 mt-1 w-44 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
            <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Format
            </p>
            {EXPORT_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                className="flex w-full px-3 py-1.5 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                onClick={() => downloadExport(f)}
              >
                {FORMAT_LABELS[f]}
                <span className="ml-auto text-xs text-zinc-400">.{f}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setImportOpen(true);
          setExportOpen(false);
        }}
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </Button>

      {importOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setImportOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-contacts-title"
          >
            <div className="border-b border-zinc-100 px-4 py-3">
              <h2
                id="import-contacts-title"
                className="text-sm font-semibold text-zinc-900"
              >
                Import contacts
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                CSV, TSV, JSON, vCard, or Excel — flexible column names
              </p>
            </div>

            <form onSubmit={onImport} className="space-y-4 p-4">
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-8 text-center hover:border-zinc-400"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-800">
                  {fileName ?? "Choose a file"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  .csv · .tsv · .json · .vcf · .xlsx (max 5 MB)
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  name="file"
                  accept={IMPORT_ACCEPT}
                  className="hidden"
                  required
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? null)
                  }
                />
              </div>

              <div className="rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                <p className="font-medium text-zinc-800">Column tips</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>
                    Headers like <code>First Name</code>, <code>email</code>,{" "}
                    <code>Company</code> work
                  </li>
                  <li>
                    A single <code>Name</code> column is split into first/last
                  </li>
                  <li>Company names are matched or created automatically</li>
                  <li>Duplicate emails in your org are skipped</li>
                </ul>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  onClick={downloadTemplate}
                >
                  Download CSV template
                </button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? "Importing…" : "Import"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* click-away for export menu */}
      {exportOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default"
          aria-label="Close export menu"
          onClick={() => setExportOpen(false)}
        />
      ) : null}
    </div>
  );
}
