import { defineAkteApp } from "akte";

import { index } from "./files";
import { jsons } from "./files/jsons";
import { pages } from "./files/pages";
import { posts } from "./files/posts";

export const app = defineAkteApp({
	files: [index, pages, posts, jsons],
	globalData: () => {
		return {
			siteDescription: "A really simple website",
		};
	},
});
