import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200",
        secondary: "border-indigo-100 bg-indigo-50 text-indigo-700",
        outline: "border-slate-200 bg-white/70 text-slate-700",
        brand: "border-teal-100 bg-teal-50 text-teal-800",
        success: "border-emerald-100 bg-emerald-50 text-emerald-700",
        danger: "border-red-100 bg-red-50 text-red-700",
        warning: "border-amber-100 bg-amber-50 text-amber-800",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
