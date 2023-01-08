import { type PluginOption } from "vite";

import { createDebugger } from "../lib/createDebugger";
import { serverPlugin } from "./plugins/serverPlugin";
import { buildPlugin } from "./plugins/buildPlugin";
import type { Options, ResolvedOptions } from "./types";

const MINIFY_HTML_DEFAULT_OPTIONS = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	keepClosingSlash: true,
	minifyCSS: true,
	removeComments: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	useShortDoctype: true,
};

const DEFAULT_OPTIONS: Omit<ResolvedOptions<unknown>, "app" | "minifyHTML"> = {
	cacheDir: ".akte",
};

const debug = createDebugger("akte:vite", true);

export const aktePlugin = <TGlobalData>(
	rawOptions: Options<TGlobalData>,
): PluginOption[] => {
	debug("plugin registered");

	const options: ResolvedOptions<TGlobalData> = {
		...DEFAULT_OPTIONS,
		...rawOptions,
		minifyHTML: false, // Gets overriden right after based on user's options
	};

	if (rawOptions.minifyHTML === false) {
		// Explicit false
		options.minifyHTML = false;
	} else if (rawOptions.minifyHTML === true) {
		// Explicit true
		options.minifyHTML = MINIFY_HTML_DEFAULT_OPTIONS;
	} else {
		// Implicit undefined or object
		options.minifyHTML = {
			...rawOptions.minifyHTML,
			...MINIFY_HTML_DEFAULT_OPTIONS,
		};
	}

	return [serverPlugin(options), buildPlugin(options)];
};
