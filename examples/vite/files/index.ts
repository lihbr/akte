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
	<h2>posts</h2>
	<ul>
		${posts.join("\n")}
	</ul>
	<h2>pages</h2>
	<ul>
		<li><a href="/foo">foo</a></li>
		<li><a href="/foo/bar">foo bar</a></li>
		<li><a href="/foo/bar/baz">foo bar baz</a></li>
	</ul>
	<h2>jsons</h2>
	<ul>
		<li><a href="/foo.json">foo</a></li>
		<li><a href="/bar.json">bar</a></li>
		<li><a href="/baz.json">baz</a></li>
	</ul>
</main>
`;

		return basic(slot);
	},
});
