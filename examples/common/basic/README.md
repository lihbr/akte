# Basic

This example shows basic usage of Akte with JavaScript or TypeScript. When executed, an Akte app configuration behaves as a minimal CLI. This is helpful for simple use cases.

Running either of the `akte.app` file build command results in the Akte project being built under the `dist` folder.

```bash
# JavaScript
node akte.app.js           # Displays help
node akte.app.js build     # Build project

# TypeScript
npx tsx akte.app.ts        # Displays help
npx tsx akte.app.ts build  # Build project
```

You can also display debug logs prefixing any of the above command with `npx cross-env DEBUG=akte:*`, e.g.

```bash
npx cross-env DEBUG=akte:* npx tsx akte.app.ts build
```
