import { userAvatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-12 w-12 text-sm",
} as const;

export function UserAvatar({
  name,
  image,
  size = "sm",
  className,
  title,
}: {
  name: string;
  image?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
  title?: string;
}) {
  const label = title ?? name;
  const src = userAvatarSrc(image);

  return (
    <span
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100",
        sizeClasses[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}
