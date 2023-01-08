import { defineAkteFile } from "akte";
import { basic } from "../layouts/basic";

export const index = defineAkteFile().from({
	path: "/",
	render: () => {
		const slot = /* html */ `<main>index</main>`;

		return basic(slot);
	},
});
