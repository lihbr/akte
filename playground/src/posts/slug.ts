import { type PrismicDocument, createClient } from "@prismicio/client";
import fetch from "node-fetch";

import { defineAkteFiles } from "akte";

const client = createClient("lihbr", {
	routes: [
		{
			path: "/posts/:uid",
			type: "post__blog",
		},
	],
	fetch,
});

export const postsSlug = defineAkteFiles<unknown, ["slug"]>().from({
	path: "/posts/:slug",
	bulkData: async () => {
		const posts = await client.getAllByType("post__blog");

		const records: Record<string, PrismicDocument> = {};
		for (const post of posts) {
			if (post.url) {
				records[post.url] = post;
			}
		}

		return records;
	},
	render: (context) => {
		return /* html */ `<main>${context.data.uid}</main>`;
	},
});
