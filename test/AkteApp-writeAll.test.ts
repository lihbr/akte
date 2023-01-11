import { posix } from "node:path";
import { expect, it, vi } from "vitest";
import { vol } from "memfs";

import { defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";

it("writes all files at default output directory", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
	});

	const files = await app.renderAll();
	await app.writeAll({ files });

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
		  "/dist/about.html": "Rendered: {\\"path\\":\\"/about\\",\\"data\\":{}}",
		  "/dist/bar.json": "Rendered: {\\"path\\":\\"/bar.json\\",\\"data\\":\\"bar\\"}",
		  "/dist/baz.json": "Rendered: {\\"path\\":\\"/baz.json\\",\\"data\\":\\"bar\\"}",
		  "/dist/foo.json": "Rendered: {\\"path\\":\\"/foo.json\\",\\"data\\":\\"foo\\"}",
		  "/dist/index.html": "Rendered: {\\"path\\":\\"/\\",\\"data\\":\\"index\\"}",
		  "/dist/pages/foo.html": "Rendered: {\\"path\\":\\"/pages/foo\\",\\"data\\":\\"foo\\"}",
		  "/dist/pages/foo/bar.html": "Rendered: {\\"path\\":\\"/pages/foo/bar\\",\\"data\\":\\"foo bar\\"}",
		  "/dist/pages/foo/bar/baz.html": "Rendered: {\\"path\\":\\"/pages/foo/bar/baz\\",\\"data\\":\\"foo bar baz\\"}",
		  "/dist/posts/bar.html": "Rendered: {\\"path\\":\\"/posts/bar\\",\\"data\\":\\"bar\\"}",
		  "/dist/posts/baz.html": "Rendered: {\\"path\\":\\"/posts/baz\\",\\"data\\":\\"bar\\"}",
		  "/dist/posts/foo.html": "Rendered: {\\"path\\":\\"/posts/foo\\",\\"data\\":\\"foo\\"}",
		}
	`);
});

it("writes all files at config-provided output directory", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		build: {
			outDir: "/foo",
		},
	});

	const files = await app.renderAll();
	await app.writeAll({ files });

	const volSnapshot = vol.toJSON();
	expect(Object.keys(volSnapshot).every((key) => key.startsWith("/foo"))).toBe(
		true,
	);
	expect(volSnapshot).toMatchInlineSnapshot(`
		{
		  "/foo/about.html": "Rendered: {\\"path\\":\\"/about\\",\\"data\\":{}}",
		  "/foo/bar.json": "Rendered: {\\"path\\":\\"/bar.json\\",\\"data\\":\\"bar\\"}",
		  "/foo/baz.json": "Rendered: {\\"path\\":\\"/baz.json\\",\\"data\\":\\"bar\\"}",
		  "/foo/foo.json": "Rendered: {\\"path\\":\\"/foo.json\\",\\"data\\":\\"foo\\"}",
		  "/foo/index.html": "Rendered: {\\"path\\":\\"/\\",\\"data\\":\\"index\\"}",
		  "/foo/pages/foo.html": "Rendered: {\\"path\\":\\"/pages/foo\\",\\"data\\":\\"foo\\"}",
		  "/foo/pages/foo/bar.html": "Rendered: {\\"path\\":\\"/pages/foo/bar\\",\\"data\\":\\"foo bar\\"}",
		  "/foo/pages/foo/bar/baz.html": "Rendered: {\\"path\\":\\"/pages/foo/bar/baz\\",\\"data\\":\\"foo bar baz\\"}",
		  "/foo/posts/bar.html": "Rendered: {\\"path\\":\\"/posts/bar\\",\\"data\\":\\"bar\\"}",
		  "/foo/posts/baz.html": "Rendered: {\\"path\\":\\"/posts/baz\\",\\"data\\":\\"bar\\"}",
		  "/foo/posts/foo.html": "Rendered: {\\"path\\":\\"/posts/foo\\",\\"data\\":\\"foo\\"}",
		}
	`);
});

it("writes all files at function-provided output directory", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		build: {
			outDir: "/foo",
		},
	});

	const files = await app.renderAll();
	await app.writeAll({ files, outDir: "/bar" });

	const volSnapshot = vol.toJSON();
	expect(Object.keys(volSnapshot).every((key) => key.startsWith("/bar"))).toBe(
		true,
	);
	expect(volSnapshot).toMatchInlineSnapshot(`
		{
		  "/bar/about.html": "Rendered: {\\"path\\":\\"/about\\",\\"data\\":{}}",
		  "/bar/bar.json": "Rendered: {\\"path\\":\\"/bar.json\\",\\"data\\":\\"bar\\"}",
		  "/bar/baz.json": "Rendered: {\\"path\\":\\"/baz.json\\",\\"data\\":\\"bar\\"}",
		  "/bar/foo.json": "Rendered: {\\"path\\":\\"/foo.json\\",\\"data\\":\\"foo\\"}",
		  "/bar/index.html": "Rendered: {\\"path\\":\\"/\\",\\"data\\":\\"index\\"}",
		  "/bar/pages/foo.html": "Rendered: {\\"path\\":\\"/pages/foo\\",\\"data\\":\\"foo\\"}",
		  "/bar/pages/foo/bar.html": "Rendered: {\\"path\\":\\"/pages/foo/bar\\",\\"data\\":\\"foo bar\\"}",
		  "/bar/pages/foo/bar/baz.html": "Rendered: {\\"path\\":\\"/pages/foo/bar/baz\\",\\"data\\":\\"foo bar baz\\"}",
		  "/bar/posts/bar.html": "Rendered: {\\"path\\":\\"/posts/bar\\",\\"data\\":\\"bar\\"}",
		  "/bar/posts/baz.html": "Rendered: {\\"path\\":\\"/posts/baz\\",\\"data\\":\\"bar\\"}",
		  "/bar/posts/foo.html": "Rendered: {\\"path\\":\\"/posts/foo\\",\\"data\\":\\"foo\\"}",
		}
	`);
});

it("throws on any write issue", async () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		build: {
			outDir: "/foo",
		},
	});

	const files = await app.renderAll();

	// Purposefully writing a file that cannot be written
	files.error = {
		toString() {
			throw new Error("write error");
		},
	} as unknown as string;

	vi.stubGlobal("console", { error: vi.fn() });

	await expect(app.writeAll({ files })).rejects.toMatchInlineSnapshot(
		"[Error: write error]",
	);
	expect(console.error).toHaveBeenCalledOnce();

	vi.unstubAllGlobals();
});
