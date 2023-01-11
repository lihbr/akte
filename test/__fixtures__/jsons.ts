import { defineAkteFiles } from "../../src";

export const jsons = defineAkteFiles().from({
	path: "/:slug.json",
	bulkData() {
		const jsons = {
			"/foo.json": "foo",
			"/bar.json": "bar",
			"/baz.json": "bar",
		};

		return jsons;
	},
	render(context) {
		return `Rendered: ${JSON.stringify(context)}`;
	},
});
