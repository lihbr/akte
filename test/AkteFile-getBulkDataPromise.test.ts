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

	// @ts-expect-error - Accessing protected method
	files.getBulkDataPromise({});
	// @ts-expect-error - Accessing protected method
	files.getBulkDataPromise({});

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

	// @ts-expect-error - Accessing protected method
	await files.getBulkDataPromise({});
	// @ts-expect-error - Accessing protected method
	await files.getBulkDataPromise({});

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

	// @ts-expect-error - Accessing protected method
	await files.getBulkDataPromise({});

	expect(dataFn).toHaveBeenCalledOnce();
});
