import type { Metadata } from "next";
import { ENGINEER } from "@/lib/constants";
import { DEFAULT_SITE_SETTINGS } from "@/types/site";

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: DEFAULT_SITE_SETTINGS.siteTitle,
    template: `%s — ${ENGINEER.shortName}`,
  },
  description: DEFAULT_SITE_SETTINGS.siteDescription,
  openGraph: {
    title: DEFAULT_SITE_SETTINGS.siteTitle,
    description: DEFAULT_SITE_SETTINGS.siteDescription,
    type: "website",
    locale: "en_US",
  },
};
