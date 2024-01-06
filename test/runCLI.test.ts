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
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		build: { outDir: "/foo" },
	});

	vi.stubGlobal("process", {
		...process,
		exit: vi.fn().mockImplementation(() => Promise.resolve()),
		argv: ["node", "akte.app.ts", "build"],
	});

	await runCLI(app);

	expect(vol.toJSON()).toMatchInlineSnapshot(`
		{
		  "/foo/about.html": "Rendered: {"path":"/about","data":{}}",
		  "/foo/bar.json": "Rendered: {"path":"/bar.json","data":"bar"}",
		  "/foo/baz.json": "Rendered: {"path":"/baz.json","data":"bar"}",
		  "/foo/foo.json": "Rendered: {"path":"/foo.json","data":"foo"}",
		  "/foo/index.html": "Rendered: {"path":"/","data":"index"}",
		  "/foo/pages/foo.html": "Rendered: {"path":"/pages/foo","data":"foo"}",
		  "/foo/pages/foo/bar.html": "Rendered: {"path":"/pages/foo/bar","data":"foo bar"}",
		  "/foo/pages/foo/bar/baz.html": "Rendered: {"path":"/pages/foo/bar/baz","data":"foo bar baz"}",
		  "/foo/posts/bar.html": "Rendered: {"path":"/posts/bar","data":"bar"}",
		  "/foo/posts/baz.html": "Rendered: {"path":"/posts/baz","data":"bar"}",
		  "/foo/posts/foo.html": "Rendered: {"path":"/posts/foo","data":"foo"}",
		}
	`);

	vi.unstubAllGlobals();
});
