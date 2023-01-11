import { defineAkteFiles } from "../../src";

export const noGlobalData = defineAkteFiles().from({
	path: "/no-global-data/:slug",
	render(context) {
		return `Rendered: ${JSON.stringify(context)}`;
	},
});
