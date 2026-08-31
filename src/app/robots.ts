export const dynamic = "force-static";

export default function robots() {
  const baseUrl = "https://civilens.razzan.site";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/reports", "/reports/create", "/login", "/register"],
        disallow: [
          "/government",
          "/bookmarks",
          "/notifications",
          "/verify-email",
          "/reset-password",
          "/verify-reset-code",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
