/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { app } from "./akte.app";

// Renders all files and returns them.
const files = await app.renderAll();

// Renders all files and returns them.
await app.writeAll({ files, outDir: "my-out-dir" });

// Renders and writes all files to the config output directory.
await app.buildAll();

// Looks up the Akte file responsible for rendering the given path.
const match = app.lookup("/foo");

// Renders a match from `app.lookup()`
const file = await app.render(match);
