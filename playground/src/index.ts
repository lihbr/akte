import { defineAkteFile } from "akte";

export const index = defineAkteFile().from({
	path: "/",
	render: () => {
		return /* html */ `<main>index</main>`;
	},
});
