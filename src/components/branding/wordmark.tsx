import Link from "next/link";
import { ENGINEER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Wordmark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href as any} className={cn("group block", className)}>
      <span className="block font-semibold tracking-[0.18em] text-foreground">
        {ENGINEER.brandName}
      </span>
      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {ENGINEER.brandSubtitle}
      </span>
    </Link>
  );
}
