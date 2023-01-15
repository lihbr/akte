import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createRequire } from "node:module";

import { __PRODUCTION__ } from "./lib/__PRODUCTION__";
import { defineAkteFiles } from "./defineAkteFiles";
import { NotFoundError } from "./errors";

/**
 * Akte welcome page shown in development when the Akte app does not have any
 * othe Akte files registered.
 *
 * @remarks
 *   The HTML code below is highlighted and uglified manually to prevent the
 *   introduction of extra dependencies just for the sake of having a welcome
 *   page.
 */
export const akteWelcome = __PRODUCTION__
	? null
	: defineAkteFiles().from({
			path: "/",
			async data() {
				try {
					const require = createRequire(path.resolve("index.js"));
					const aktePath = require.resolve("akte/package.json");
					const htmlPath = path.resolve(aktePath, "../dist/akteWelcome.html");

					return {
						html: await fs.readFile(htmlPath, "utf-8"),
					};
				} catch (error) {
					throw new NotFoundError("/");
				}
			},
			bulkData() {
				// Never build the file
				return {};
			},
			render(context) {
				return context.data.html;
			},
	  });
