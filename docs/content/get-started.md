---
title: Get Started
---

# Get Started

Getting started with Akte takes a few minutes and consists of two things:
1. Setting up Akte
2. Picking up a development flavor

:::callout{icon=🎠 title="Don't want to commit yet?"}
Have a look at [the examples](/examples) to get a feeling of what Akte looks like, [some are even available on Stackblitz](/examples#vite).
:::

## Akte setup

1. Install Akte

```bash
npm install --save-dev akte
```

2. Create an `akte.app.ts`[^1] file

```typescript
import { defineAkteApp } from "akte";

export const app = defineAkteApp({
	files: [],
});
```

:::callout{icon=⚙ title="Configuration"}
Discover more configuration options in the [app configuration ›](/api#defineakteapp)
:::

## Development Flavor

Don't be afraid to make a wrong choice here as you can easily switch between development flavors.

### Akte CLI

Akte CLI is minimal and only allows you to build your Akte app. Use it over Vite, when you don't need Vite or just want to experiment with Akte.

To run Akte CLI and build your app, just execute your `akte.app.ts` file.

```bash
node akte.app.js build
npx tsx akte.app.ts build
```

Your built app will be available in the `dist` directory.

:::callout{icon=🕹 title="Usage"}
Discover more about the CLI usage in the [CLI references ›](/api#cli)
:::

### Vite

Akte integrates with [Vite](https://vitejs.dev), this allows you to leverage Vite development server and assets processing pipeline to enrich your app.

1. Install additional dependencies[^2]

```bash
npm install --save-dev vite html-minifier-terser
```

2. Create or update your `vite.config.ts` file

```typescript
import { defineConfig } from "vite";
import akte from "akte/vite";
import { app } from "./akte.app";

export default defineConfig({
	plugins: [akte({ app })],
});
```

3. Add `.akte` to your `.gitignore` file

```ignore
.akte
```

You're ready to start developing your Akte app through Vite.

```bash
npx vite
npx vite build
```


:::callout{icon=⚙ title="Configuration"}
Discover more configuration options in the [Vite plugin configuration ›](/api#akte-plugin)
:::

## Next steps

Well done! Whether you opted for the CLI or Vite, you're ready to start developing with Akte.

- [Check out the guide to learn more about Akte usage ›](/guide)
- [Check out the examples to get inspiration ›](/examples)

[^1]: Akte also works with plain JavaScript! While most of the snippets in the documentation are TypeScript, don't be afraid of them. Everything works the same way or is indicated so when otherwise~
[^2]: You can omit `html-minifier-terser` if you don't want HTML to be minified by Akte. You will need to disable explicitly the `minifyHTML` option of the Vite plugin, [see its configuration](/api#akte-plugin).
