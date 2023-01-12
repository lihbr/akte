import { defineAkteApp, defineAkteFile, defineAkteFiles } from "akte";

// Unique file
const index = defineAkteFile().from({
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

		return /* html */ `<main>
	<h1>basic javascript</h1>
	<p>${context.globalData.siteDescription}</p>
	<ul>
		${posts.join("\n")}
	</ul>
</main>
`;
	},
});

// Multiple files
const posts = defineAkteFiles().from({
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
		return /* html */ `<main>
	<a href="/">index</a>
	<h1>${context.data.title}</h1>
	<p>${context.data.body}</p>
</main>`;
	},
});

export const app = defineAkteApp({
	files: [index, posts],
	globalData: () => {
		return {
			siteDescription: "A really simple website",
		};
	},
});
