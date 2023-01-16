---
title: API References
---

# API References

Exhaustive but simplified Akte API references.

## Classes

### `AkteApp`

:::callout{icon=🈂 title="Type export only"}
Only the type is exported, to create an instance of `AkteApp`, see [`defineAkteApp`](#defineakteapp).
:::

An Akte app, ready to be interacted with.

#### `lookup`

Looks up the Akte file responsible for rendering the path.

```typescript
(path: string) => Match;
```

Throws `NotFoundError` when path could not be looked up.

#### `render`

Renders a match from `lookup`.

```typescript
(match: Match) => Promise<string>;
```

Throws `NotFoundError` when match could not be rendered.

#### `renderAll`

Renders all Akte files.

```typescript
() => Promise<Record<string, string>>; // Record<path, content>
```

#### `writeAll`

Writes a map of rendered Akte files.

```typescript
(args: {
	outDir?: string; // Defaults to the app configured one, or `"dist"`
	files: Record<string, string>;
}) => Promise<void>;
```

#### `buildAll`

Builds (renders and writes) all Akte files.

```typescript
(args: {
	outDir?: string; // Defaults to the app configured one, or `"dist"`
}) => Promise<string[]>; // Built files
```

#### `clearCache`

Akte caches all `globalData`, `bulkData`, `data` calls for performance. The `clearCache` method allows you to clear these caches.

```typescript
// Only clears global data cache unless `true`
(alsoClearFileCache?: boolean) => void;
```

### `AkteFiles`

:::callout{icon=🈂 title="Type export only"}
Only the type is exported, to create an instance of `AkteFiles`, see [`defineAkteFile`](#defineaktefile) and [`defineAkteFiles`](#defineaktefiles).
:::

An Akte files, managing its data cascade and rendering process.

:::callout{icon=🤫 title="Internal API (for now)"}
Methods and properties from the `AkteFiles` class are not documented for now and to be considered internal. They are the ones that are the most likely to evolve.

If you're looking to render a single file, don't be afraid to spin up and `AkteApp`, even if it's just for it.

<br />

```typescript
import { defineAkteApp } from "akte";
import { foo } from "./foo"; // An `AkteFiles` instance

const app = defineAkteApp({ files: [foo] });

const file = await app.render(app.lookup("/foo"));
```
:::

### `NotFoundError`

Creates a 404 error. To be used within Akte files definition `data` function.

```typescript
import { NotFoundError } from "akte";

new NotFoundError(path);            // Pure 404
new NotFoundError(path, { cause }); // Maybe 500
```

## Factories

### `defineAkteApp`

Creates an Akte app from given configuration.

```typescript
import { defineAkteApp } from "akte";

defineAkteApp(config);
defineAkteApp<GlobalDataType>(config);
```

#### Config

*[Simplified from sources~](https://github.com/lihbr/akte/blob/master/src/AkteApp.ts#L25-L63)*

```typescript
type Config<TGlobalData> = {
	// Akte files this config is responsible for.
	files: AkteFiles[];

	// Required when global data type is defined or inferred.
	globalData?: () => Awaitable<TGlobalData>;

	// Configuration related to Akte build process.
	build?: {
		// Only used by the CLI build command, defaults to `"dist"`
		outDir?: string;
	};
};
```

### `defineAkteFile`

Creates an Akte files instance for a single file from a definition.

```typescript
import { defineAkteFile } from "akte";

defineAkteFile().from(definition);
defineAkteFile<GlobalDataType>().from(definition);
defineAkteFile<GlobalDataType, DataType>().from(definition);
```

#### Definition

*[Simplified from sources~](https://github.com/lihbr/akte/blob/master/src/defineAkteFile.ts#L9-L12)*

```typescript
type Definition<TGlobalData, TData> = {
	// Path for the Akte file, e.g. `/about` or `/sitemap.xml`
	path: string;

	// Required when data type is defined.
	data?: (context: {
		path: string;
		globalData: TGlobalData;
	}) => Awaitable<TData>;

	// Function to render the file.
	render: (context: {
		path: string;
		globalData: TGlobalData;
		data: TData;
	}) => Awaitable<string>;
};
```

### `defineAkteFiles`

Creates an Akte files instance from a definition.

```typescript
import { defineAkteFiles } from "akte";

defineAkteFiles().from(definition);
defineAkteFiles<GlobalDataType>().from(definition);
defineAkteFiles<GlobalDataType, ParamsTuple>().from(definition);
defineAkteFiles<GlobalDataType, ParamsTuple, DataType>().from(definition);
```

#### Definiton

*[Simplified from sources~](https://github.com/lihbr/akte/blob/master/src/AkteFiles.ts#L50-L94)*

```typescript
type Definition<TGlobalData, TParams, TData> = {
	// Path pattern for the Akte files, e.g. `/posts/:slug` or `/**`
	path: string;

	// Inferred from `bulkData` when not provided. Used for
	// optimization when rendering only one file (e.g. for serverless)
	data?: (context: {
		path: string;
		params: Record<TParams[number], string>;
		globalData: TGlobalData;
	}) => Awaitable<TData>;

	// Required when data type is defined.
	bulkData?: (context: {
		globalData: TGlobalData;
	}) => Awaitable<Record<string, TData>>;

	// Function to render each file.
	render: (context: {
		path: string;
		globalData: TGlobalData;
		data: TData;
	}) => Awaitable<string>;
};
```

## Vite

### `akte` (plugin)

Akte Vite plugin factory.

```typescript
import { defineConfig } from "vite";
import akte from "akte/vite";
import { app } from "./akte.app";

export default defineConfig({
	plugins: [akte({ app, ...options })],
});
```

#### Options

*[Simplified from sources~](https://github.com/lihbr/akte/blob/master/src/vite/types.ts#L6-L33)*

```typescript
type Options<TGlobalData> = {
	app: AkteApp<TGlobalData>;

	// Has to be a children of Vite `root` directory.
	// Defaults to `".akte"`
	cacheDir?: string;

	// On by defaults, requires `html-minifier-terser` to be installed.
	minifyHTML?: boolean : MinifyHTMLOptions;
}
```

*[See `html-minifier-terser` documentation](https://github.com/terser/html-minifier-terser#options-quick-reference) for available options.*

## CLI

Akte integrates a small CLI for minimal use cases allowing you to build a given app without processing it through [Vite](#vite). The CLI can be run by executing your Akte app configuration.

### Usage

```bash
node akte.app.js <command>
npx tsx akte.app.ts <command>
```

### Commands

| Command | Description                |
| ------- | -------------------------- |
| `build` | Build the current Akte app |

### Flags

| Flag              | Description     |
| ----------------- | --------------- |
| `--silent`, `-s`  | Silence output  |
| `--help`, `-h`    | Display help    |
| `--version`, `-v` | Display version |
