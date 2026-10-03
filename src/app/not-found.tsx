import Link from "next/link";
import { ENGINEER } from "@/lib/constants";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-lg text-muted">
        The requested route does not exist on {ENGINEER.shortName}&apos;s portfolio.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex text-sm text-primary underline-offset-4 hover:underline"
      >
        Return home
      </Link>
    </Container>
  );
}
