---
title: Get started
toc: false
---

# Get started

1. Install dependencies

```bash
npm install --save-dev akte
```

2. Create an `akte.app.ts` file

```typescript
import { defineAkteFile } from "akte";

export const app = defineAkteApp({
	files: [],
});
```

:::callout{icon=ℹ title="Configuration"}
Discover more configuration options in the [app configuration ›](/api#app)
:::

:::callout{icon=✨ title="Well done!"}
You're ready to start developing with Akte.

- [Check out the guides for basic usage ›](/guide)
- [Check out how to integrate your App with Vite ›](/guide#vite)
:::
