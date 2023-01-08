import { defineAkteFile } from "akte";

export const sitemap = defineAkteFile().from({
	path: "/foo/sitemap.xml",
	render: () => {
		const slot = /* xml */ `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
	<url>
		<loc>https://lihbr.com/404</loc>
		<lastmod>2023-01-04T14:24:46.082Z</lastmod>
	</url>
</urlset>
`;

		return slot;
	},
});
