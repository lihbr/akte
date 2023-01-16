import { expect, it, vi } from "vitest";

import { createRouter } from "radix3";

import { defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";

vi.mock("radix3", () => {
	return {
		createRouter: vi.fn().mockImplementation(() => {
			return {
				insert: vi.fn(),
			};
		}),
	};
});

it("fixes catch-all path", () => {
	const app = defineAkteApp({
		files: [pages],
	});

	// @ts-expect-error - Accessing protected method
	const router = app.getRouter();

	// One for `/**`, one for `/`
	expect(router.insert).toHaveBeenCalledTimes(2);
});

it("caches router", () => {
	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
	});

	// @ts-expect-error - Accessing protected method
	app.getRouter();
	// @ts-expect-error - Accessing protected method
	app.getRouter();

	expect(createRouter).toHaveBeenCalledOnce();
});
