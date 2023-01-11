import { expectTypeOf, it } from "vitest";
import { defineAkteFile } from "../src";

it("infers data from data", () => {
	defineAkteFile().from({
		path: "/",
		render(context) {
			expectTypeOf(context.data).toBeUnknown();

			return "";
		},
	});

	defineAkteFile().from({
		path: "/",
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

it("supports global data generic", () => {
	defineAkteFile().from({
		path: "/",
		render(context) {
			expectTypeOf(context.globalData).toBeUnknown();

			return "";
		},
	});

	defineAkteFile<number>().from({
		path: "/",
		render(context) {
			expectTypeOf(context.globalData).toBeNumber();
			// @ts-expect-error - globalData is of type number
			expectTypeOf(context.globalData).toBeString();

			return "";
		},
	});
});

it("support data generic", () => {
	defineAkteFile<unknown, number>().from({
		path: "/",
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

	defineAkteFile<unknown, number>().from({
		path: "/",
		// @ts-expect-error - data is of type number
		data() {
			return "";
		},
		render(context) {
			expectTypeOf(context.data).toBeNumber();
			// @ts-expect-error - data is of type number
			expectTypeOf(context.data).toBeString();

			return "";
		},
	});
});
