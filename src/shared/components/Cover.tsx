import { cn } from "@/shared/lib/utils";

export function Cover({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return <div className={cn("bg-cx-black", className)} aria-hidden />;
  }
  return (
    // Photographic assets from Unsplash / local SVG fallbacks
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("bg-cx-black object-cover", className)} />
  );
}
