import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
      <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
