import { defineAkteFiles } from "akte";

import { basic } from "../layouts/basic";

export const pages = defineAkteFiles().from({
	path: "/**",
	bulkData() {
		// We assume those are sourced one way or another
		const pages = {
			"/foo": "foo",
			"/foo/bar": "foo bar",
			"/foo/bar/baz": "foo bar baz",
		};

		return pages;
	},
	render(context) {
		const slot = /* html */ `<main>
	<h1>${context.data}</h1>
</main>`;

		return basic(slot);
	},
});
