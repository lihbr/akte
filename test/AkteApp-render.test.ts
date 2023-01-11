import { expect, it } from "vitest";

import { NotFoundError, defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";
import { renderError } from "./__fixtures__/renderError";

const app = defineAkteApp({
	files: [index, about, pages, posts, jsons, renderError],
});

it("renders matched path", async () => {
	await expect(app.render(app.lookup("/"))).resolves.toMatchInlineSnapshot(
		'"Rendered: {\\"path\\":\\"/\\",\\"data\\":\\"index\\"}"',
	);
	await expect(app.render(app.lookup("/about"))).resolves.toMatchInlineSnapshot(
		'"Rendered: {\\"path\\":\\"/about\\"}"',
	);
	await expect(
		app.render(app.lookup("/posts/foo")),
	).resolves.toMatchInlineSnapshot(
		'"Rendered: {\\"path\\":\\"/posts/foo\\",\\"data\\":\\"foo\\"}"',
	);
	await expect(
		app.render(app.lookup("/pages/foo/bar")),
	).resolves.toMatchInlineSnapshot(
		'"Rendered: {\\"path\\":\\"/pages/foo/bar\\",\\"data\\":\\"foo bar\\"}"',
	);
	await expect(
		app.render(app.lookup("/foo.json")),
	).resolves.toMatchInlineSnapshot(
		'"Rendered: {\\"path\\":\\"/foo.json\\",\\"data\\":\\"foo\\"}"',
	);
});

it("throws `NotFoundError` when render data function throws a `NotFoundError`", async () => {
	try {
		await app.render(app.lookup("/posts/akte"));
	} catch (error) {
		expect(error).toBeInstanceOf(NotFoundError);
		expect(error).toMatchInlineSnapshot(
			"[Error: Could lookup file for path `/posts/akte`]",
		);
		expect((error as NotFoundError).cause).toBeUndefined();
	}

	expect.assertions(3);
});

it("throws `NotFoundError` when render data function throws any error and forward original error", async () => {
	try {
		await app.render(app.lookup("/render-error/foo"));
	} catch (error) {
		expect(error).toBeInstanceOf(NotFoundError);
		expect(error).toMatchInlineSnapshot(`
			[Error: Could lookup file for path \`/render-error/foo\`

			Error: render error]
		`);
		expect((error as NotFoundError).cause).toBeDefined();
	}

	expect.assertions(3);
});
