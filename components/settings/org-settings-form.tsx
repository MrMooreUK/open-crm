"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateOrganization } from "@/lib/actions/settings";
import {
  CURRENCIES,
  DATE_FORMATS,
  FISCAL_YEAR_MONTHS,
  LOCALES,
  TIMEZONES,
  WEEK_STARTS,
} from "@/lib/settings-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type OrgFormValues = {
  name: string;
  timezone: string;
  currency: string;
  locale: string;
  dateFormat: string;
  weekStartsOn: number;
  fiscalYearStartMonth: number;
};

export function OrgSettingsForm({
  values,
  canEdit,
}: {
  values: OrgFormValues;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateOrganization(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Organization
        </h3>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={values.name}
            required
            disabled={!canEdit}
          />
        </div>
      </section>

      <section className="space-y-3 border-t border-zinc-100 pt-5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Regional
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Defaults for money, dates, and time across the workspace
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              name="timezone"
              defaultValue={values.timezone}
              disabled={!canEdit}
            >
              {!TIMEZONES.some((t) => t.value === values.timezone) ? (
                <option value={values.timezone}>{values.timezone}</option>
              ) : null}
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Default currency</Label>
            <Select
              id="currency"
              name="currency"
              defaultValue={values.currency}
              disabled={!canEdit}
            >
              {!CURRENCIES.some((c) => c.code === values.currency) ? (
                <option value={values.currency}>{values.currency}</option>
              ) : null}
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
            <p className="text-[11px] text-zinc-400">
              Used for new deals and pipeline totals
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="locale">Locale</Label>
            <Select
              id="locale"
              name="locale"
              defaultValue={values.locale}
              disabled={!canEdit}
            >
              {!LOCALES.some((l) => l.value === values.locale) ? (
                <option value={values.locale}>{values.locale}</option>
              ) : null}
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <p className="text-[11px] text-zinc-400">
              Number and date formatting style
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateFormat">Date format</Label>
            <Select
              id="dateFormat"
              name="dateFormat"
              defaultValue={values.dateFormat}
              disabled={!canEdit}
            >
              {DATE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} — {f.example}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weekStartsOn">Week starts on</Label>
            <Select
              id="weekStartsOn"
              name="weekStartsOn"
              defaultValue={String(values.weekStartsOn)}
              disabled={!canEdit}
            >
              {WEEK_STARTS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fiscalYearStartMonth">Fiscal year starts</Label>
            <Select
              id="fiscalYearStartMonth"
              name="fiscalYearStartMonth"
              defaultValue={String(values.fiscalYearStartMonth)}
              disabled={!canEdit}
            >
              {FISCAL_YEAR_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
            <p className="text-[11px] text-zinc-400">
              Used for future reports and dashboards
            </p>
          </div>
        </div>
      </section>

      {canEdit ? (
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save settings"}
        </Button>
      ) : (
        <p className="text-xs text-zinc-500">Only owners can edit settings.</p>
      )}
    </form>
  );
}
