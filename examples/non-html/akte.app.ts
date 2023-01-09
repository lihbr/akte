import { defineAkteApp, defineAkteFiles } from "akte";

const jsons = defineAkteFiles().from({
	path: "/:slug.json",
	bulkData() {
		// We assume those are sourced one way or another
		const jsons = {
			"/foo.json": "foo",
			"/bar.json": "bar",
			"/baz.json": "bar",
		};

		return jsons;
	},
	render(context) {
		return JSON.stringify(context);
	},
});

export const app = defineAkteApp({ files: [jsons] });
