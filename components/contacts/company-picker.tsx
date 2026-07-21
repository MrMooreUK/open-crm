"use client";

import { useMemo, useRef, useState } from "react";
import { Building2, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CompanyOption = { id: string; name: string; domain?: string | null };

export function CompanyPicker({
  companies,
  value,
  companyName,
  onChange,
  disabled,
  autoFocus,
  placeholder = "Search or create a company…",
}: {
  companies: CompanyOption[];
  value: string;
  companyName?: string;
  onChange: (next: { companyId: string; companyName: string }) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = companies.find((c) => c.id === value);
  const closedLabel = selected?.name ?? companyName ?? "";
  const inputValue = open ? (query ?? closedLabel) : closedLabel;

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) return companies.slice(0, 8);
    return companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.domain && c.domain.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [companies, query]);

  const typed = (query ?? "").trim();
  const exactMatch = companies.some(
    (c) => c.name.toLowerCase() === typed.toLowerCase()
  );
  const canCreate = typed.length > 0 && !exactMatch;

  function pick(company: CompanyOption) {
    onChange({ companyId: company.id, companyName: "" });
    setQuery(null);
    setOpen(false);
  }

  function createNew() {
    if (!typed) return;
    onChange({ companyId: "", companyName: typed });
    setQuery(null);
    setOpen(false);
  }

  function clear() {
    onChange({ companyId: "", companyName: "" });
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
          setQuery(null);
        }
      }}
    >
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 shadow-sm transition-colors",
          open && "ring-2 ring-zinc-400",
          disabled && "opacity-50"
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          onFocus={() => {
            setOpen(true);
            setQuery(closedLabel);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value || companyName) {
              onChange({ companyId: "", companyName: "" });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered[0] && typed) {
                const exact = filtered.find(
                  (c) => c.name.toLowerCase() === typed.toLowerCase()
                );
                pick(exact ?? filtered[0]);
              } else if (canCreate) {
                createNew();
              }
            }
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(null);
            }
          }}
        />
        {(value || companyName || inputValue) && !disabled ? (
          <button
            type="button"
            onClick={clear}
            className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Clear company"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <input type="hidden" name="companyId" value={value} />
      <input type="hidden" name="companyName" value={companyName ?? ""} />

      {open && !disabled ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 && !canCreate ? (
            <p className="px-3 py-2 text-xs text-zinc-500">
              Type a name to create a company
            </p>
          ) : null}

          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50",
                c.id === value && "bg-zinc-50"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="min-w-0 flex-1 truncate font-medium text-zinc-900">
                {c.name}
              </span>
              {c.domain ? (
                <span className="truncate text-xs text-zinc-400">{c.domain}</span>
              ) : null}
            </button>
          ))}

          {canCreate ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-zinc-100 px-3 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={createNew}
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <span>
                Create <span className="font-medium">“{typed}”</span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      {companyName && !value ? (
        <p className="mt-1 text-[11px] text-zinc-500">
          Will create company <span className="font-medium">{companyName}</span>
        </p>
      ) : null}
    </div>
  );
}
