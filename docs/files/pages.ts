import * as path from "node:path";
import * as fs from "fs/promises";

import { defineAkteFiles } from "akte";
import { globby } from "globby";

import { markdownToHTML } from "../akte/markdownToHTML";
import { base } from "../layouts/base";

const contentDir = path.resolve(__dirname, "../content");

const readFile = (file: string): Promise<string> => {
	return fs.readFile(path.resolve(contentDir, file), "utf-8");
};

export const pages = defineAkteFiles<{ version: string }>().from({
	path: "/**",
	async bulkData() {
		const pagePaths = await globby("**/*.md", { cwd: contentDir });

		type Matter = {
			title?: string;
			toc?: boolean;
		};

		const pages: Record<
			string,
			{
				html: string;
				matter: Matter;
			}
		> = {};

		for (const pagePath of pagePaths) {
			const path = `/${pagePath.replace(/(index)?\.md/, "")}`;
			pages[path] = await markdownToHTML<Matter>(await readFile(pagePath));
		}

		pages["/changelog"] = await markdownToHTML<Matter>(
			await readFile("../../CHANGELOG.md"),
		);

		return pages;
	},
	render(context) {
		const navigation = Object.entries({
			"/get-started": "Get started",
			"/guide": "Guide",
			"/api": "API",
			"/examples": "Examples",
			"/comparisons": "Comparisons",
		}).map(([path, label]) => {
			return /* html */ `<li>
			<a href="${path}"${path === context.path ? ' class="active"' : ""}>${label}</a>
		</li>`;
		});

		const slot = /* html */ `
		<header>
			<figure>
				<a href="/"><img src="/logo.svg" alt="Akte Logo" width="134" height="82" /></a>
				<a href="/changelog" title="Open changelog">v${
					context.globalData.version
				}</a> - <a href="https://github.com/lihbr/akte" target="_blank" rel="noopener noreferrer">GitHub</a>
			</figure>
			<nav>
				<ul>${navigation.join("")}</ul>
			</nav>
		</header>
		${context.data.html}
		<footer>
			<hr />
			<p>
				<a href="https://github.com/lihbr/akte" target="_blank" rel="noopener noreferrer">GitHub</a> - <a href="https://twitter.com/li_hbr" target="_blank" rel="noopener noreferrer">Twitter</a> - <a href="https://mastodon.social/@lihbr" target="_blank" rel="noopener noreferrer">Mastodon</a>
				<a href="https://plausible.io/akte.js.org" target="_blank" rel="noopener noreferrer" style="float:right;">Analytics</a>
			</p>
			<br />
			<p>© 2023-present Lucie Haberer - MIT License</p>
		</footer>
		`;

		return base(slot, { path: context.path, title: context.data.matter.title });
	},
});
