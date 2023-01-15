import { defineAkteApp } from "akte";

import { index } from "./src/pages/index";
import { sitemap } from "./src/pages/sitemap";
import { postsSlug } from "./src/pages/posts/slug";
import { catchAll } from "./src/pages/catchAll";

export const app = defineAkteApp({
	files: [],
	// files: [index, sitemap, postsSlug, catchAll],
	globalData: () => {
		return 1;
	},
});
