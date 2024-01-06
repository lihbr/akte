import { posix } from "node:path";
import { expect, it } from "vitest";
import { vol } from "memfs";

import { defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";

it("builds all files at default output directory", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
	});

	await app.buildAll();

	const volSnapshot = Object.fromEntries(
		Object.entries(vol.toJSON()).map(([key, value]) => [
			`/${posix.relative(
				// Windows has some issues with `posix.relative()`...
				process.platform === "win32"
					? posix.join(process.cwd(), "../")
					: process.cwd(),
				key,
			)}`,
			value,
		]),
	);
	expect(volSnapshot).toMatchInlineSnapshot(`
		{
		  "/dist/about.html": "Rendered: {"path":"/about","data":{}}",
		  "/dist/bar.json": "Rendered: {"path":"/bar.json","data":"bar"}",
		  "/dist/baz.json": "Rendered: {"path":"/baz.json","data":"bar"}",
		  "/dist/foo.json": "Rendered: {"path":"/foo.json","data":"foo"}",
		  "/dist/index.html": "Rendered: {"path":"/","data":"index"}",
		  "/dist/pages/foo.html": "Rendered: {"path":"/pages/foo","data":"foo"}",
		  "/dist/pages/foo/bar.html": "Rendered: {"path":"/pages/foo/bar","data":"foo bar"}",
		  "/dist/pages/foo/bar/baz.html": "Rendered: {"path":"/pages/foo/bar/baz","data":"foo bar baz"}",
		  "/dist/posts/bar.html": "Rendered: {"path":"/posts/bar","data":"bar"}",
		  "/dist/posts/baz.html": "Rendered: {"path":"/posts/baz","data":"bar"}",
		  "/dist/posts/foo.html": "Rendered: {"path":"/posts/foo","data":"foo"}",
		}
	`);
});

it("builds all files at config-provided output directory", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		build: {
			outDir: "/foo",
		},
	});

	await app.buildAll();

	const volSnapshot = vol.toJSON();
	expect(Object.keys(volSnapshot).every((key) => key.startsWith("/foo"))).toBe(
		true,
	);
	expect(volSnapshot).toMatchInlineSnapshot(`
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
});

it("builds all files at function-provided output directory", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		build: {
			outDir: "/foo",
		},
	});

	await app.buildAll({ outDir: "/bar" });

	const volSnapshot = vol.toJSON();
	expect(Object.keys(volSnapshot).every((key) => key.startsWith("/bar"))).toBe(
		true,
	);
	expect(volSnapshot).toMatchInlineSnapshot(`
		{
		  "/bar/about.html": "Rendered: {"path":"/about","data":{}}",
		  "/bar/bar.json": "Rendered: {"path":"/bar.json","data":"bar"}",
		  "/bar/baz.json": "Rendered: {"path":"/baz.json","data":"bar"}",
		  "/bar/foo.json": "Rendered: {"path":"/foo.json","data":"foo"}",
		  "/bar/index.html": "Rendered: {"path":"/","data":"index"}",
		  "/bar/pages/foo.html": "Rendered: {"path":"/pages/foo","data":"foo"}",
		  "/bar/pages/foo/bar.html": "Rendered: {"path":"/pages/foo/bar","data":"foo bar"}",
		  "/bar/pages/foo/bar/baz.html": "Rendered: {"path":"/pages/foo/bar/baz","data":"foo bar baz"}",
		  "/bar/posts/bar.html": "Rendered: {"path":"/posts/bar","data":"bar"}",
		  "/bar/posts/baz.html": "Rendered: {"path":"/posts/baz","data":"bar"}",
		  "/bar/posts/foo.html": "Rendered: {"path":"/posts/foo","data":"foo"}",
		}
	`);
});

it("returns built files", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
	});

	await expect(app.buildAll()).resolves.toMatchInlineSnapshot(`
		[
		  "/index.html",
		  "/about.html",
		  "/pages/foo.html",
		  "/pages/foo/bar.html",
		  "/pages/foo/bar/baz.html",
		  "/posts/foo.html",
		  "/posts/bar.html",
		  "/posts/baz.html",
		  "/foo.json",
		  "/bar.json",
		  "/baz.json",
		]
	`);
});
