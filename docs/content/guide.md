---
title: Guide
---

# Guide

How to use Akte to achieve what you want.

## Defining files

Files are the central part of Akte. You can define two kinds of files.
- Single files like `/about` or `/sitemap.xml`
- Collection of files like `/posts/:slug` or even catch-all routes

In any case, for files to be taken into account by your app, you need to register them in your `akte.app.ts` file.

```diff
  import { defineAkteFile } from "akte";
+ import { foo } from "./foo"; // An Akte files

  export const app = defineAkteApp({
- 	files: [],
+ 	files: [foo],
  });
```

### Single files

Define a single file using `defineAkteFile`.

```typescript
import { defineAkteFile } from "akte";

const about = defineAkteFile().from({
	path: "/about",
	data(context) { /* Optional, see data section */ },
	render(context) {
		return /* html */ `<h1>About</h1>`;
	},
});
```

### Collection of files

Define a collection of files using `defineAkteFiles`.

```typescript
import { defineAkteFiles } from "akte";

const posts = defineAkteFiles().from({
	path: "/posts/:slug",
	data(context) { /* Optional, see data section */ },
	bulkData() {
		// Akte can't guess which paths you want to generate
		// for collection of files, so you need at least to
		// return a map of path to generate. More about
		// working with data below.
		return {
			"/posts/foo": {},
			"/posts/bar": {},
			"/posts/baz": {},
		};
	},
	render(context) {
		return /* html */ `<h1>${context.path}</h1>`;
	},
});
```

## Routing

Akte uses the `path` property of your file definitions to handle routing and define which file to generate. Route patterns and matching algorithm are powered by [`radix3`](https://github.com/unjs/radix3).

### Static

Static routes are meant to be used with single files.

| `path` value | Route matched | File generated    |
| ------------ | ------------- | ----------------- |
| `/`          | `/`           | `/index.html`     |
| `/foo`       | `/foo`        | `/foo.html`       |
| `/bar/`      | `/bar/`       | `/bar/index.html` |
| `/baz.json`  | `/baz.json`   | `/baz.json`       |

### Dynamic

Dynamic routes are meant to be used with collection of files.

| `path` value    | Example route matched | Example file generated    |
| --------------- | --------------------- | ------------------------- |
| `/:id`          | `/foo`                | `/foo.html`               |
| `/:cat/:id`     | `/baz/baz`            | `/bar/baz.html`           |
| `/posts/:slug`  | `/posts/qux`          | `/posts/qux.html`         |
| `/api/:id.json` | `/api/quux.json`      | `/api/quux.json`          |

:::callout{icon=ℹ title="Typing path parameters"}
You can type path parameters on your Akte files when defining them. This will enforce correct `path` value and type the `params` object of the `data` function.

```typescript
defineAkteFiles<GlobalDataType, ["cat", "id"]>().from({
	path: "/posts/:cat/:id",
	/* ... */
};
```
:::

### Catch-all

Catch-all routes are also available for collection of files.

| `path` value    | Example route matched    | Example file generated   |
| --------------- | ------------------------ | ------------------------ |
| `/**`           | `/foo/bar/baz`           | `/foo/bar/baz.html`      |
| `/pages/**`     | `/pages/qux/quux`        | `/pages/qux/quux.html`   |
| `/api/**.json`  | `/api/corge/grault.json` | `/api/corge/grault.json` |

:::callout{icon=⚠ title="Catch-all routes root"}
Catch-all routes will match the root of the catch-all route, e.g. `/**` also matches `/` and `/pages/**` also matches `/pages`
:::

### Routing priority

In some cases, you can end up with multiple files matching the same route (e.g. `/` and `/**` both match `/`). When this happens, the priority is given to the file registered last within your Akte app configuration.

## Working with data

Akte works with two kinds of data:
- Global data, they are available throughout the whole app
- File data, they are specific to each file getting rendered

### Global data

Global data are defined on your Akte app. It's a function or an asynchronous function that returns them.

```typescript
import { defineAkteFile } from "akte";

export const app = defineAkteApp({
	files: [/* ... */],
	globalData() {
		// Fetch API, read files, etc.
		return globalData;
	},
});
```

### Bulk data

Bulk data defines all the data needed to render all files defined with `defineAkteFiles`. It's a function or an asynchronous function that returns a map of path and file data.

```typescript
import { defineAkteFiles } from "akte";

const posts = defineAkteFiles().from({
	path: "/posts/:slug",
	bulkData(context) {
		// Fetch API, read files, etc.
		return bulkData;
	},
	render(context) {
		return /* html */ `<h1>${context.path}</h1>`;
	},
});
```

:::callout{icon=⚡ title="Optimize for performances"}
While the `bulkData` function is at least necessary to define which files to render, it also exists to optimize build time. Most APIs allow you to query content in bulk, by doing so, less requests are made and build can be faster.
:::

#### Context

`bulkData` functions all receive the same `context` argument, it contains:
- `globalData`: application global data

Use it as needed to compute your bulk data appropriately.

### Data

Data defines the data needed to render a file at a given path defined with `defineAkteFile`. It's a function or an asynchronous function that returns the file data.

```typescript
import { defineAkteFile } from "akte";

const about = defineAkteFile().from({
	path: "/about",
	data(context) {
		// Fetch API, read files, etc.
		return data;
	},
	render(context) {
		return /* html */ `<h1>About</h1>`;
	},
});
```

:::callout{icon=⚡ title="Data with collection of files"}
The `data` function can optionally be provided for files defined with `defineAkteFiles` (by default it is inferred from the files `bulkData` function). This allows to optimize the file rendering process during single renders, e.g. rendering on serverless environment.
:::

#### Context

`data` functions all receive the same `context` argument, it contains:
- `path`: the path of the rendered file
- `params`: path parameters for collection of files
- `globalData`: application global data

Use it as needed to compute your bulk data appropriately.

## Rendering

Akte uses your file `render` functions to render them as strings. These functions can be asynchronous, however, it's recommended to keep async behaviors within `data` and `bulkData`.

### Context

`render` functions all receive the same `context` argument, it contains:
- `path`: the path of the rendered file
- `globalData`: application global data
- `data`: data for this file, type is inferred from `data` or `bulkData`

Use it to render each of your files appropriately.

### Templating

Akte templating is string-based. While this doesn't prevent you from pulling in a templating engine of your liking, ES6 template literals can get you quite far with à-la-JSX syntax.

```tsx
// JSX
return (<section>
	<h1 className="foo">{ context.path }</h1>
</section>);

// Template literals
return /* html */ `<section>
	<h1 class="foo">${ context.path }</h1>
</section>`;
```

:::callout{icon=💡 title="Getting a better experience"}
You can get HTML highlighting, autocompletion, IntelliSense, and more for template literals by leveraging extensions like [`es6-string-html`](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html) (that's why you've been seeing those `/* html */` comments)
:::

#### Wrapping output

Because rendering is all JavaScript based, you can create your own functions to make templating easier. For example, you can wrap your output within a layout like so.

```typescript
const wrapInLayout = (slot: string): string => {
	return /* html */ `<!doctype html>
<html lang="en">
	<head>
		<title>My App</title>
	</head>
	<body>
		<header>...</header>
		${slot}
		<footer>...</footer>
	</body>
</html>
`;
};

// Later in your rendering function...
return wrapInLayout(/* html */ `...`);
```

Or make some "components" of your own.

```typescript
const header = (args: { displayLogo?: boolean; }): string => {
	return /* html */ `<header>
	${args.displayLogo ? `<img src="/logo.svg" alt="logo" />`: ""}
	<nav>
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href="/posts">Blog</a></li>
			<li><a href="/about">About</a></li>
		</ul>
	</nav>
</header>`
};

// Later in your rendering function...
return /* html */ `${header({ displayLogo: true })}...`;
```

## Programmatic usage

Your Akte app can be imported and used programmatically. To do so, it exposes various methods you can use to achieve different goals, including serverless usage.

### Looking up a path

You can know if a path is handled by your Akte app using the `lookup` method.

```typescript
import { app } from "./akte.app";

try {
	const match = app.lookup("/foo");
} catch (error) {
	// Path is not handled...
}
```

### Rendering a path

Pairing `lookup` with the `render` method allows you to render a path. The `render` method resolves global data and the file's data, caches them, then runs your file `render` function for the request path.

```typescript
import { app } from "./akte.app";

try {
	const match = app.lookup("/foo");
	const file = await app.render(match);
} catch (error) {
	// Path is not handled...
}
```

### Rendering all files

You can render all your app files with the `renderAll` method.

```typescript
import { app } from "./akte.app";

// Record<path, content>
const files = await app.renderAll();
```

### Writing all files

You can write a map of rendered files with the `writeAll` method.

```typescript
import { app } from "./akte.app";

const files = await app.renderAll();
await app.writeAll({ files });
```

All files will, by default, be written to the app `build.outDir` directory which defaults to `dist`. When calling `writeAll` you can specify another directory.

```typescript
import { app } from "./akte.app";

const files = await app.renderAll();
await app.writeAll({ files, outDir: "out" });
```

For convenience, the `buildAll` method is available. It renders and writes all files, then returns an array of files written.

```typescript
import { app } from "./akte.app";

// Same effect as the previous example, `outDir` is optional
await app.buildAll({ files, outDir: "out" });
```

### Clearing cache

Akte caches all `globalData`, `bulkData`, `data` calls for performance. The `clearCache` method allows you to clear these caches.

```typescript
import { app } from "./akte.app";

// Clear global data cache
app.clearCache();

// Clear global data, data, and bulk data cache
app.clearCache(true);
```

## Debugging

Akte reports on what it's doing using the [`debug`](https://github.com/debug-js/debug) package. Track performances and debug your app by setting the `DEBUG` environment variable before running Akte.

### Akte CLI

```bash
npx cross-env DEBUG=akte:* node akte.app.js build
npx cross-env DEBUG=akte:* npx tsx akte.app.ts build
```

### Vite

```bash
npx cross-env DEBUG=akte:* vite
npx cross-env DEBUG=akte:* vite build
```
