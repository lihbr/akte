import { defineAkteFile } from "akte";
import { basic } from "../layouts/basic";

export const index = defineAkteFile().from({
	path: "/",
	data() {
		console.log("data");

		return "foo";
	},
	render: () => {
		const slot = /* html */ `<main>index</main>`;

		return basic(slot);
	},
});
