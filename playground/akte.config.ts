import { defineAkteConfig } from "akte";

import { index } from "./src/index";
import { postsSlug } from "./src/posts/slug";

export const statish = defineAkteConfig({
	files: [index, postsSlug],
	globalData: () => 1,
});
