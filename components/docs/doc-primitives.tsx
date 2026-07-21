import { Badge } from "@/components/ui/badge";

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[12px] text-zinc-800">
      {children}
    </code>
  );
}

export function Pre({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-[12px] leading-relaxed text-zinc-800">
      {children}
    </pre>
  );
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-zinc-600">{children}</p>;
}

export function DocList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-zinc-700">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Endpoint({
  method,
  path,
  auth,
  children,
}: {
  method: string;
  path: string;
  auth: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand" className="font-mono uppercase">
          {method}
        </Badge>
        <Code>{path}</Code>
        <span className="text-[11px] text-zinc-400">{auth}</span>
      </div>
      <div className="space-y-2 text-sm text-zinc-600">{children}</div>
    </section>
  );
}

export function DocH({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {children}
    </h4>
  );
}
