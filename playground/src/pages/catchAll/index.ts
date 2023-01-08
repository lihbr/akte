import { defineAkteFiles } from "akte";
import { basic } from "../../layouts/basic";

export const catchAll = defineAkteFiles().from({
	path: "/catch-all/**",
	bulkData() {
		return {
			"/catch-all": {},
			"/catch-all/foo": {},
			"/catch-all/foo/bar": {},
			"/catch-all/foo/bar/baz": {},
		};
	},
	render: (context) => {
		const slot = /* html */ `<main>${context.path}</main>`;

		return basic(slot);
	},
});
