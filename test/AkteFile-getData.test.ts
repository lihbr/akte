import { expect, it, vi } from "vitest";

import { defineAkteFiles } from "../src";

it("caches data", () => {
	const dataFn = vi.fn().mockImplementation(() => true);

	const files = defineAkteFiles().from({
		path: "/:slug",
		data: dataFn,
		render(context) {
			return `Rendered: ${JSON.stringify(context)}`;
		},
	});

	files.getData({ path: "/foo", params: {}, globalData: {} });
	files.getData({ path: "/foo", params: {}, globalData: {} });

	expect(dataFn).toHaveBeenCalledOnce();
});

it("caches data promise", async () => {
	const dataFn = vi.fn().mockImplementation(() => Promise.resolve(true));

	const files = defineAkteFiles().from({
		path: "/:slug",
		data: dataFn,
		render(context) {
			return `Rendered: ${JSON.stringify(context)}`;
		},
	});

	await files.getData({ path: "/foo", params: {}, globalData: {} });
	await files.getData({ path: "/foo", params: {}, globalData: {} });

	expect(dataFn).toHaveBeenCalledOnce();
});

it("infers data from bulk data when data is not implemented", async () => {
	const bulkDataFn = vi.fn().mockImplementation(() => ({
		"/foo": true,
	}));

	const files = defineAkteFiles().from({
		path: "/:slug",
		bulkData: bulkDataFn,
		render(context) {
			return `Rendered: ${JSON.stringify(context)}`;
		},
	});

	await files.getData({ path: "/foo", params: {}, globalData: {} });

	expect(bulkDataFn).toHaveBeenCalledOnce();
});

it("throws when neither data and bulk data are implemented", () => {
	const files = defineAkteFiles().from({
		path: "/:slug",
		render(context) {
			return `Rendered: ${JSON.stringify(context)}`;
		},
	});

	expect(() =>
		files.getData({ path: "/foo", params: {}, globalData: {} }),
	).toThrowErrorMatchingInlineSnapshot(
		'"Cannot render file for path `/foo`, no `data` or `bulkData` function available"',
	);
});
