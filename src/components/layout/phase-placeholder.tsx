import Link from "next/link";
import { ENGINEER } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";

export function PhasePlaceholder({
  title,
  route,
  description,
}: {
  title: string;
  route: string;
  description: string;
}) {
  return (
    <Container className="flex flex-1 flex-col justify-center py-16">
      <Badge variant="primary">Phase 1 foundation</Badge>
      <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">
        {route}
      </p>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted">{description}</p>
      <p className="mt-8 text-sm text-muted">
        Public UI, database schema, and CMS editors ship in later phases.{" "}
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Return home
        </Link>
        .
      </p>
      <p className="mt-10 font-mono text-xs text-muted">
        {ENGINEER.fullName} · {ENGINEER.title}
      </p>
    </Container>
  );
}
