import { defineConfig } from "tsup";
import { cp, rm, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export default defineConfig({
  clean: true,
  dts: true,
  entryPoints: ["./src/index.mts", "./src/bin.mts"],
  format: ["cjs", "esm"],
  // publicDir: "./src/templates",
  shims: true,
  async onSuccess() {
    const distPath = join(__dirname, "dist");

    await rm(join(distPath, "migrations")).catch(() => {});
    await cp(join(__dirname, "src/templates"), join(distPath, "templates"), {
      recursive: true,
    });

    const distFolder = await readdir(distPath, { withFileTypes: true });

    for (const dirent of distFolder) {
      const { name } = dirent;

      const filePath = join(distPath, name);

      if (dirent.isFile() && name.endsWith(".js")) {
        const file = await readFile(filePath, {
          encoding: "utf-8",
        });

        await writeFile(
          filePath,
          file.replace(/"(fs\/promises|path|url)"/g, '"node:$1"')
        );
      }
    }
  },
});
