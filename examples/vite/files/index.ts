import { defineAkteFile } from "akte";

import { basic } from "../layouts/basic";

export const index = defineAkteFile<{ siteDescription: string }>().from({
	path: "/",
	data() {
		// We assume those are sourced one way or another
		const posts = {
			"/posts/foo": "foo",
			"/posts/bar": "bar",
			"/posts/baz": "bar",
		};

		return { posts };
	},
	render(context) {
		const posts = Object.entries(context.data.posts).map(
			([href, title]) => /* html */ `<li><a href="${href}">${title}</a></li>`,
		);

		const slot = /* html */ `<main>
	<h1>basic typescript</h1>
	<p>${context.globalData.siteDescription}</p>
	<ul>
		${posts.join("\n")}
	</ul>
</main>
`;

		return basic(slot);
	},
});
