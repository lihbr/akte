---
title: Welcome!
toc: false
---

# Welcome to Akte!

## Get started

Remove this welcome page by adding your first Akte file to your `akte.app.ts` configuration[^1].

```typescript
import { defineAkteFile, defineAkteApp } from "akte";
	
const myFirstFile = defineAkteFile().from({
	path: "/",
	render() {
		return "Hello World!";
	},
});

export const app = defineAkteApp({
	files: [myFirstFile],
});
```

## Documentation

Learn more about Akte, browse references, and find examples on [Akte documentation](https://akte.js.org?source=welcome).

[^1]: This file is only shown in development when no other Akte files are registered within your `akte.app.ts` configuration. When bundling Akte (e.g. for serverless usage), this file gets tree shaken out of the bundle.
