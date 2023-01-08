import { defineAkteApp } from "akte";

import { index } from "./src/pages/index";
import { postsSlug } from "./src/pages/posts/slug";

export const app = defineAkteApp({
	files: [index, postsSlug],
	globalData: () => {
		console.log("globalData");

		return 1;
	},
});
