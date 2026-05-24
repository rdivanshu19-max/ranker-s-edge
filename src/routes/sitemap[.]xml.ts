import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { RESOURCES } from "@/lib/resources";

// TODO: replace with your project URL once a custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/resources", "/ai-tutor", "/about"];
        const dynamicPaths = RESOURCES.map((r) => `/resource/${r.key}`);
        const urls = [...staticPaths, ...dynamicPaths]
          .map(
            (p) =>
              `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});