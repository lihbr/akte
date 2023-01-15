import { defineConfig } from "vite";
import akte from "akte/vite";

import { app } from "./akte.app";

export default defineConfig({ plugins: [akte({ app })] });
