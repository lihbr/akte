import { it } from "vitest";
import { defineAkteApp, defineAkteFiles } from "../src";

const noGlobalData = defineAkteFiles().from({
	path: "/:slug",
	render() {
		return "";
	},
});

const numberGlobalData = defineAkteFiles<number>().from({
	path: "/:slug",
	render() {
		return "";
	},
});

const objectGlobalData = defineAkteFiles<{ foo: number }>().from({
	path: "/:slug",
	render() {
		return "";
	},
});

it("infers global data from files", () => {
	defineAkteApp({
		files: [noGlobalData, numberGlobalData],
		globalData() {
			return 1;
		},
	});

	defineAkteApp({
		files: [noGlobalData, numberGlobalData],
		// @ts-expect-error - globalData is of type number
		globalData() {
			return "";
		},
	});
});

it("makes global data optional when possible", () => {
	defineAkteApp({
		files: [noGlobalData],
	});

	defineAkteApp({
		files: [noGlobalData],
		globalData() {
			return 1;
		},
	});

	// @ts-expect-error - globalData is required
	defineAkteApp({
		files: [noGlobalData, objectGlobalData],
	});
});

it("enforces global data consistency", () => {
	defineAkteApp({
		files: [numberGlobalData],
		globalData() {
			return 1;
		},
	});

	defineAkteApp({
		// @ts-expect-error - globalData is of type number
		files: [numberGlobalData, objectGlobalData],
		globalData() {
			return 1;
		},
	});
});

it("supports global data generic", () => {
	defineAkteApp<number>({
		files: [numberGlobalData],
	});

	defineAkteApp<number>({
		// @ts-expect-error - globalData is of type number
		files: [objectGlobalData],
	});
});
