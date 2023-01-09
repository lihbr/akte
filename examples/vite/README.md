# Vite

This example shows usage of Akte as a [Vite][vite] plugin. This is helpful for processing assets of any sort as well as taking advantage of Vite great developer experience while developing.

Running the `akte.app` file build command results in the Akte project being built under the `dist` folder.

Using Vite CLI results in the Akte project being served or built accordingly and processed by Vite.

```bash
npm run dev    # Dev project
npm run build  # Build project
```

To work with Vite, Akte relies on a `.akte` cache folder (configurable). This folder is meant to be gitignored.

```ignore
.akte
```

[vite]: https://vitejs.dev
