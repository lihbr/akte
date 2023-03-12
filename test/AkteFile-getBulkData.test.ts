import { expect, it, vi } from "vitest";

import { defineAkteFile, defineAkteFiles } from "../src";

it("caches bulk data", () => {
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

	files.getBulkData({ globalData: {} });
	files.getBulkData({ globalData: {} });

	expect(bulkDataFn).toHaveBeenCalledOnce();
});

it("caches bulk data promise", async () => {
	const bulkDataFn = vi.fn().mockImplementation(() =>
		Promise.resolve({
			"/foo": true,
		}),
	);

	const files = defineAkteFiles().from({
		path: "/:slug",
		bulkData: bulkDataFn,
		render(context) {
			return `Rendered: ${JSON.stringify(context)}`;
		},
	});

	await files.getBulkData({ globalData: {} });
	await files.getBulkData({ globalData: {} });

	expect(bulkDataFn).toHaveBeenCalledOnce();
});

it("infers bulk data from data on single file", async () => {
	const dataFn = vi.fn().mockImplementation(() => true);

	const files = defineAkteFile().from({
		path: "/",
		data: dataFn,
		render(context) {
			return `Rendered: ${JSON.stringify(context)}`;
		},
	});

	await files.getBulkData({ globalData: {} });

	expect(dataFn).toHaveBeenCalledOnce();
});
