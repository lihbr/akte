import { defineAkteFile } from "../../src";

export const index = defineAkteFile().from({
	path: "/",
	data() {
		return "index";
	},
	render(context) {
		return `Rendered: ${JSON.stringify(context)}`;
	},
});
