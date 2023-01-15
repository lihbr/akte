import { defineAkteApp } from "akte";

import { version } from "../package.json";
import { pages } from "./files/pages";

export const app = defineAkteApp({
	files: [pages],
	globalData() {
		return {
			version,
		};
	},
});
