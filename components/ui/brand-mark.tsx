import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-7 w-7 text-[11px]",
  lg: "h-9 w-9 text-sm",
} as const;

/** open-crm logo mark — gradient tile with monogram */
export function BrandMark({
  size = "sm",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-cyan-700 font-bold text-white shadow-sm shadow-teal-900/10",
        sizes[size],
        className
      )}
      aria-hidden
    >
      OC
    </div>
  );
}

export function BrandWordmark({
  size = "sm",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark size={size} />
      <span className="text-sm font-semibold tracking-tight text-zinc-900">
        open-crm
      </span>
    </span>
  );
}
