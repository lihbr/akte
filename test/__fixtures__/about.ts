import { defineAkteFile } from "../../src";

export const about = defineAkteFile().from({
	path: "/about",
	render(context) {
		return `Rendered: ${JSON.stringify(context)}`;
	},
});
