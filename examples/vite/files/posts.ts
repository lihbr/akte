import { defineAkteFiles } from "akte";

import { basic } from "../layouts/basic";

export const posts = defineAkteFiles().from({
	path: "/posts/:slug",
	bulkData() {
		// We assume those are sourced one way or another
		const posts = {
			"/posts/foo": {
				title: "foo",
				body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, dignissimos enim qui cupiditate provident cumque distinctio id reiciendis quia consectetur fugiat dolorem mollitia laborum libero natus et, vero voluptatibus dolorum?",
			},
			"/posts/bar": {
				title: "bar",
				body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, dignissimos enim qui cupiditate provident cumque distinctio id reiciendis quia consectetur fugiat dolorem mollitia laborum libero natus et, vero voluptatibus dolorum?",
			},
			"/posts/baz": {
				title: "baz",
				body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, dignissimos enim qui cupiditate provident cumque distinctio id reiciendis quia consectetur fugiat dolorem mollitia laborum libero natus et, vero voluptatibus dolorum?",
			},
		};

		return posts;
	},
	render(context) {
		const slot = /* html */ `<main>
	<h1>${context.data.title}</h1>
	<p>${context.data.body}</p>
</main>`;

		return basic(slot);
	},
});
