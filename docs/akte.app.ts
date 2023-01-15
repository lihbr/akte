import { defineAkteApp } from "akte";

import { version } from "../package.json";

import { pages } from "./files/pages";
import { sitemap } from "./files/sitemap";

export const app = defineAkteApp({
	files: [pages, sitemap],
	globalData() {
		return {
			version,
		};
	},
});
