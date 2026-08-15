import type { MetadataRoute } from "next";

const SITE_URL = "https://bdsorkarichakri.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Filtered/query-string variants of the listing page canonicalize to
        // the base URL (see metadata.alternates on /jobs), so they don't
        // need to be blocked here — just left out of the sitemap.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
