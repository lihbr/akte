import { expect, it, vi } from "vitest";

import { defineAkteApp } from "../src";

import { index } from "./__fixtures__";
import { about } from "./__fixtures__/about";
import { pages } from "./__fixtures__/pages";
import { posts } from "./__fixtures__/posts";
import { jsons } from "./__fixtures__/jsons";

it("caches global data", async () => {
	const globalDataFn = vi.fn().mockImplementation(() => true);

	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		globalData: globalDataFn,
	});

	app.getGlobalData();
	app.getGlobalData();

	expect(globalDataFn).toHaveBeenCalledOnce();
});

it("caches global data promise", async () => {
	const globalDataFn = vi.fn().mockImplementation(() => Promise.resolve(true));

	const app = defineAkteApp({
		files: [index, about, pages, posts, jsons],
		globalData: globalDataFn,
	});

	app.getGlobalData();
	app.getGlobalData();

	expect(globalDataFn).toHaveBeenCalledOnce();
});
