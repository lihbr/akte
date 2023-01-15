import type { Options as MinifyHTMLOptions } from "html-minifier-terser";

import { type AkteApp } from "../AkteApp";

/** Akte Vite plugin options. */
export type Options<TGlobalData> = {
	/** Akte app to run the plugin with. */
	app: AkteApp<TGlobalData>;

	/**
	 * Cache file used by Akte during Vite dev and build process.
	 *
	 * @remarks
	 *   This file _has_ to be a child directory of Vite's root directory.
	 * @defaultValue `".akte"`
	 */
	cacheDir?: string;

	/**
	 * By default Akte Vite plugin will minify Akte generated HTML upon Vite build
	 * using `html-minifier-terser`.
	 * {@link https://github.com/lihbr/akte/blob/master/src/vite/aktePlugin.ts#L8-L18 Sensible defaults are used by default}.
	 *
	 * You can use this option to provide additional parameters to
	 * `html-minifier-terser`,
	 * {@link https://github.com/terser/html-minifier-terser#options-quick-reference see its documentation}.
	 *
	 * @remarks
	 *   When enabled, `html-minifier-terser` needs to be installed separately as a
	 *   development dependency for the build process to succeed.
	 */
	minifyHTML?: boolean | MinifyHTMLOptions;
};

/** @internal */
export type ResolvedOptions<TGlobalData> = {
	app: AkteApp<TGlobalData>;
	cacheDir: string;
	minifyHTML: false | MinifyHTMLOptions;
};
