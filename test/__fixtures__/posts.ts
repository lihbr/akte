import { defineAkteFiles } from "../../src";

export const posts = defineAkteFiles().from({
	path: "/posts/:slug",
	bulkData() {
		const posts = {
			"/posts/foo": "foo",
			"/posts/bar": "bar",
			"/posts/baz": "bar",
		};

		return posts;
	},
	render(context) {
		return `Rendered: ${JSON.stringify(context)}`;
	},
});
