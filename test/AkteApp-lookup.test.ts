import { expect, it } from "vitest";

import { NotFoundError, defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";

const app = defineAkteApp({ files: [index, about, pages, posts, jsons] });

it("looks up regular paths", () => {
	expect(app.lookup("/")).toStrictEqual(
		expect.objectContaining({
			file: index,
			path: "/",
		}),
	);
	expect(app.lookup("/about")).toStrictEqual(
		expect.objectContaining({
			file: about,
			path: "/about",
		}),
	);
});

it("looks up regular paths with parameters", () => {
	expect(app.lookup("/posts/foo")).toStrictEqual(
		expect.objectContaining({
			file: posts,
			params: {
				slug: "foo",
			},
			path: "/posts/foo",
		}),
	);
	expect(app.lookup("/posts/akte")).toStrictEqual(
		expect.objectContaining({
			file: posts,
			params: {
				slug: "akte",
			},
			path: "/posts/akte",
		}),
	);
});

it("looks up catch-all paths", () => {
	expect(app.lookup("/pages")).toStrictEqual(
		expect.objectContaining({
			file: pages,
			path: "/pages",
		}),
	);
	expect(app.lookup("/pages/foo")).toStrictEqual(
		expect.objectContaining({
			file: pages,
			path: "/pages/foo",
		}),
	);
	expect(app.lookup("/pages/foo/bar")).toStrictEqual(
		expect.objectContaining({
			file: pages,
			path: "/pages/foo/bar",
		}),
	);
	expect(app.lookup("/pages/foo/bar/baz")).toStrictEqual(
		expect.objectContaining({
			file: pages,
			path: "/pages/foo/bar/baz",
		}),
	);
	expect(app.lookup("/pages/foo/bar/baz/akte")).toStrictEqual(
		expect.objectContaining({
			file: pages,
			path: "/pages/foo/bar/baz/akte",
		}),
	);
});

it("looks up non-html paths", () => {
	expect(app.lookup("/foo.json")).toStrictEqual(
		expect.objectContaining({
			file: jsons,
			params: {
				slug: "foo",
			},
			path: "/foo.json",
		}),
	);
	expect(app.lookup("/akte.json")).toStrictEqual(
		expect.objectContaining({
			file: jsons,
			params: {
				slug: "akte",
			},
			path: "/akte.json",
		}),
	);
});

it("throws `NotFoundError` on unknown path", () => {
	try {
		app.lookup("/foo");
	} catch (error) {
		expect(error).toBeInstanceOf(NotFoundError);
	}

	expect(() => app.lookup("/foo")).toThrowErrorMatchingInlineSnapshot(
		`[Error: Could lookup file for path \`/foo\`]`,
	);
	expect(() => app.lookup("/foo.png")).toThrowErrorMatchingInlineSnapshot(
		`[Error: Could lookup file for path \`/foo.png\`]`,
	);
	expect(() => app.lookup("/posts/foo.png")).toThrowErrorMatchingInlineSnapshot(
		`[Error: Could lookup file for path \`/posts/foo.png\`]`,
	);
	expect(() => app.lookup("/posts/foo/bar")).toThrowErrorMatchingInlineSnapshot(
		`[Error: Could lookup file for path \`/posts/foo/bar\`]`,
	);
	expect(() =>
		app.lookup("/pages/foo/bar.png"),
	).toThrowErrorMatchingInlineSnapshot(
		`[Error: Could lookup file for path \`/pages/foo/bar.png\`]`,
	);

	expect.assertions(6);
});
