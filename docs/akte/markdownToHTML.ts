import { type Plugin, type Processor, unified } from "unified";

import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { type VFile, matter } from "vfile-matter";
import remarkRehype from "remark-rehype";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeToc from "rehype-toc";
import rehypeStringify from "rehype-stringify";

import { common, createStarryNight } from "@wooorm/starry-night";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { type ElementContent, type Root } from "hast";

const rehypeStarryNight: Plugin<[], Root> = () => {
	const starryNightPromise = createStarryNight(common);
	const prefix = "language-";

	return async (tree) => {
		const starryNight = await starryNightPromise;

		visit(tree, "element", (node, index, parent) => {
			if (!parent || index === null || node.tagName !== "pre") {
				return;
			}

			const head = node.children[0];

			if (
				!head ||
				head.type !== "element" ||
				head.tagName !== "code" ||
				!head.properties
			) {
				return;
			}

			const classes = head.properties.className;

			if (!Array.isArray(classes)) {
				return;
			}

			const language = classes.find(
				(d) => typeof d === "string" && d.startsWith(prefix),
			);

			if (typeof language !== "string") {
				return;
			}

			const scope = starryNight.flagToScope(language.slice(prefix.length));

			// Maybe warn?
			if (!scope) {
				return;
			}

			const fragment = starryNight.highlight(toString(head), scope);
			const children = fragment.children as ElementContent[];

			parent.children.splice(index, 1, {
				type: "element",
				tagName: "figure",
				properties: {
					className: [
						"highlight",
						`highlight-${scope.replace(/^source\./, "").replace(/\./g, "-")}`,
					],
				},
				children: [
					{ type: "element", tagName: "pre", properties: {}, children },
				],
			});
		});
	};
};

let processor: Processor;

export const markdownToHTML = async <TMatter extends Record<string, unknown>>(
	markdown: string,
): Promise<{
	matter: TMatter;
	html: string;
}> => {
	if (!processor) {
		processor = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkFrontmatter, ["yaml"])
			.use(() => (_: Root, file: VFile) => {
				matter(file);
			})
			.use(remarkRehype, { allowDangerousHtml: true })

			.use(rehypeSlug)
			.use(rehypeAutolinkHeadings, { behavior: "wrap" })
			.use(rehypeToc, {
				headings: ["h2", "h3"],
				cssClasses: {
					list: "",
					listItem: "",
					link: "",
				},
			})
			.use(() => (tree: Root) => {
				visit(tree, "element", (node, index, parent) => {
					if (!parent || index === null) {
						return;
					}

					switch (node.tagName) {
						case "nav":
							node.children.unshift({
								type: "element",
								tagName: "h2",
								children: [
									{
										type: "text",
										value: "Table of Contents",
									},
								],
							});

							return;

						case "a":
							if (
								typeof node.properties?.href === "string" &&
								/^https?:\/\//.test(node.properties.href)
							) {
								node.properties.target = "_blank";
								node.properties.rel = "noopener noreferrer";
							}

						default:
					}
				});
			})

			.use(rehypeStarryNight)
			.use(rehypeStringify, { allowDangerousHtml: true });
	}
	const virtualFile = await processor.process(markdown);

	return {
		matter: virtualFile.data.matter as TMatter,
		html: virtualFile.toString(),
	};
};
