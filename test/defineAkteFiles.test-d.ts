import { expectTypeOf, it } from "vitest";
import { defineAkteFiles } from "../src";

it("infers data from data", () => {
	defineAkteFiles().from({
		path: "/:slug",
		render(context) {
			expectTypeOf(context.data).toBeUnknown();

			return "";
		},
	});

	defineAkteFiles().from({
		path: "/:slug",
		data() {
			return 1;
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});
});

it("infers data from bulkData", () => {
	defineAkteFiles().from({
		path: "/:slug",
		render(context) {
			expectTypeOf(context.data).toBeUnknown();

			return "";
		},
	});

	defineAkteFiles().from({
		path: "/:slug",
		bulkData() {
			return { "/foo": 1 };
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});
});

it("forces data and bulkData to return the same type of data", () => {
	defineAkteFiles().from({
		path: "/:slug",
		data() {
			return 1;
		},
		bulkData() {
			return { "/foo": 1 };
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});

	defineAkteFiles().from({
		path: "/:slug",
		data() {
			return "";
		},
		// @ts-expect-error - data is of type string
		bulkData() {
			return { "/foo": 1 };
		},
		render(context) {
			// @ts-expect-error - data is of type string
			expectTypeOf(context.data).toBeNumber();
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});

	defineAkteFiles().from({
		path: "/:slug",
		data() {
			return 1;
		},
		// @ts-expect-error - data is of type number
		bulkData() {
			return { "/foo": "" };
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});
});

it("supports global data generic", () => {
	defineAkteFiles().from({
		path: "/:slug",
		render(context) {
			expectTypeOf(context.globalData).toBeUnknown();

			return "";
		},
	});

	defineAkteFiles<number>().from({
		path: "/:slug",
		render(context) {
			expectTypeOf(context.globalData).toBeNumber();
			// @ts-expect-error - globalData is of type number
			expectTypeOf(context.globalData).toBeString();

			return "";
		},
	});
});

it("supports params generic", () => {
	defineAkteFiles<unknown, ["slug"]>().from({
		path: "/:slug",
		render() {
			return "";
		},
	});

	defineAkteFiles<unknown, ["slug"]>().from({
		// @ts-expect-error - path should contain :slug
		path: "/:not-slug",
		render() {
			return "";
		},
	});

	defineAkteFiles<unknown, ["taxonomy", "slug"]>().from({
		path: "/:taxonomy/:slug",
		render() {
			return "";
		},
	});

	defineAkteFiles<unknown, ["taxonomy", "slug"]>().from({
		// @ts-expect-error - path should contain :taxonomy
		path: "/:slug",
		render() {
			return "";
		},
	});
});

it("support data generic", () => {
	defineAkteFiles<unknown, string[], number>().from({
		path: "/:slug",
		data() {
			return 1;
		},
		bulkData() {
			return { "/foo": 1 };
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});

	defineAkteFiles<unknown, string[], number>().from({
		path: "/:slug",
		// @ts-expect-error - data is of type number
		data() {
			return "";
		},
		// @ts-expect-error - data is of type number
		bulkData() {
			return { "/foo": "" };
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});
});
