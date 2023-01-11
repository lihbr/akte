import { expect, it, vi } from "vitest";
import { vol } from "memfs";

import { defineAkteApp } from "../src";
import { runCLI } from "../src/runCLI";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";

it("builds product upon build command", async () => {
	const app = defineAkteApp({ files: [index, about, pages, posts, jsons] });

	vi.stubGlobal("process", {
		...process,
		exit: vi.fn().mockImplementation(() => Promise.resolve()),
		argv: ["node", "akte.app.ts", "build"],
	});

	await runCLI(app);

	expect(vol.toJSON()).toMatchInlineSnapshot(`
		{
		  "/libraries/desktop/akte/dist/about.html": "Rendered: {\\"path\\":\\"/about\\",\\"data\\":{}}",
		  "/libraries/desktop/akte/dist/bar.json": "Rendered: {\\"path\\":\\"/bar.json\\",\\"data\\":\\"bar\\"}",
		  "/libraries/desktop/akte/dist/baz.json": "Rendered: {\\"path\\":\\"/baz.json\\",\\"data\\":\\"bar\\"}",
		  "/libraries/desktop/akte/dist/foo.json": "Rendered: {\\"path\\":\\"/foo.json\\",\\"data\\":\\"foo\\"}",
		  "/libraries/desktop/akte/dist/index.html": "Rendered: {\\"path\\":\\"/\\",\\"data\\":\\"index\\"}",
		  "/libraries/desktop/akte/dist/pages/foo.html": "Rendered: {\\"path\\":\\"/pages/foo\\",\\"data\\":\\"foo\\"}",
		  "/libraries/desktop/akte/dist/pages/foo/bar.html": "Rendered: {\\"path\\":\\"/pages/foo/bar\\",\\"data\\":\\"foo bar\\"}",
		  "/libraries/desktop/akte/dist/pages/foo/bar/baz.html": "Rendered: {\\"path\\":\\"/pages/foo/bar/baz\\",\\"data\\":\\"foo bar baz\\"}",
		  "/libraries/desktop/akte/dist/posts/bar.html": "Rendered: {\\"path\\":\\"/posts/bar\\",\\"data\\":\\"bar\\"}",
		  "/libraries/desktop/akte/dist/posts/baz.html": "Rendered: {\\"path\\":\\"/posts/baz\\",\\"data\\":\\"bar\\"}",
		  "/libraries/desktop/akte/dist/posts/foo.html": "Rendered: {\\"path\\":\\"/posts/foo\\",\\"data\\":\\"foo\\"}",
		}
	`);

	vi.unstubAllGlobals();
});
