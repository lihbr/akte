import { defineAkteFiles } from "../../src";

export const pages = defineAkteFiles().from({
	path: "/pages/**",
	bulkData() {
		const pages = {
			"/pages/foo": "foo",
			"/pages/foo/bar": "foo bar",
			"/pages/foo/bar/baz": "foo bar baz",
		};

		return pages;
	},
	render(context) {
		return `Rendered: ${JSON.stringify(context)}`;
	},
});
