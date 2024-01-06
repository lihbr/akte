import { expect, it, vi } from "vitest";

import { defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";
import { renderError } from "./__fixtures__/renderError";
import { noGlobalData } from "./__fixtures__/noGlobalData";

it("renders all files", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
	});

	await expect(app.renderAll()).resolves.toMatchInlineSnapshot(`
		{
		  "/about.html": "Rendered: {"path":"/about","data":{}}",
		  "/bar.json": "Rendered: {"path":"/bar.json","data":"bar"}",
		  "/baz.json": "Rendered: {"path":"/baz.json","data":"bar"}",
		  "/foo.json": "Rendered: {"path":"/foo.json","data":"foo"}",
		  "/index.html": "Rendered: {"path":"/","data":"index"}",
		  "/pages/foo.html": "Rendered: {"path":"/pages/foo","data":"foo"}",
		  "/pages/foo/bar.html": "Rendered: {"path":"/pages/foo/bar","data":"foo bar"}",
		  "/pages/foo/bar/baz.html": "Rendered: {"path":"/pages/foo/bar/baz","data":"foo bar baz"}",
		  "/posts/bar.html": "Rendered: {"path":"/posts/bar","data":"bar"}",
		  "/posts/baz.html": "Rendered: {"path":"/posts/baz","data":"bar"}",
		  "/posts/foo.html": "Rendered: {"path":"/posts/foo","data":"foo"}",
		}
	`);
});

it("does not render files with no global data methods", async () => {
	const app = defineAkteApp({
		files: [noGlobalData],
	});

	await expect(app.renderAll()).resolves.toMatchInlineSnapshot("{}");
});

it("throws on any render issue", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons, renderError],
	});

	vi.stubGlobal("console", { error: vi.fn() });

	await expect(app.renderAll()).rejects.toMatchInlineSnapshot(
		"[Error: render error]",
	);
	expect(console.error).toHaveBeenCalledOnce();

	vi.unstubAllGlobals();
});

it("deduplicates and warns about duplicate files", async () => {
	const app = defineAkteApp({
		files: [index, index],
	});

	await expect(app.renderAll()).resolves.toMatchInlineSnapshot(`
		{
		  "/index.html": "Rendered: {"path":"/","data":"index"}",
		}
	`);
});
