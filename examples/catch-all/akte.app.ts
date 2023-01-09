import { defineAkteApp, defineAkteFiles } from "akte";

const pages = defineAkteFiles().from({
	path: "/**",
	bulkData() {
		// We assume those are sourced one way or another
		const pages = {
			"/foo": "foo",
			"/foo/bar": "bar",
			"/foo/bar/baz": "bar",
		};

		return pages;
	},
	render(context) {
		return /* html */ `<main>
	<h1>${context.data}</h1>
</main>`;
	},
});

export const app = defineAkteApp({ files: [pages] });
