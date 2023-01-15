import * as path from "node:path";

import { defineAkteFile } from "akte";
import { globby } from "globby";

const contentDir = path.resolve(__dirname, "../content");

export const sitemap = defineAkteFile().from({
	path: "/sitemap.xml",
	async data() {
		const pagePaths = await globby("**/*.md", { cwd: contentDir });
		const pages: string[] = [];

		for (const pagePath of pagePaths) {
			pages.push(`/${pagePath.replace(/(index)?\.md/, "")}`);
		}

		pages.push("/changelog");

		return pages.filter((page) => page !== "/404");
	},
	render(context) {
		const now = new Date().toISOString().replace(/\..+/, "+0000");

		const urls = context.data
			.map((page) => {
				return /* xml */ `<url>
	<loc>https://akte.js.org${page}</loc>
	<lastmod>${now}</lastmod>
</url>`;
			})
			.join("\n");

		const slot = /* xml */ `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>
`;

		return slot;
	},
});
