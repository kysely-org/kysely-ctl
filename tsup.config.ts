import { defineConfig } from "tsup";
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";

export default defineConfig({
  clean: true,
  dts: true,
  entryPoints: ["./src/index.mts", "./src/bin.mts"],
  format: ["cjs", "esm"],
  // publicDir: "./src/templates",
  shims: true,
  async onSuccess() {
    await rm(join(__dirname, "dist/migrations")).catch(() => {});
    await cp(
      join(__dirname, "src/templates"),
      join(__dirname, "dist/templates"),
      { recursive: true }
    );
  },
});
