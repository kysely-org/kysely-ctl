import { isWindows, runtime } from "std-env";
import { getConsumerPackageJSON } from "./pkg-json.mjs";

export async function importTSFile(path: string): Promise<any> {
  if (runtime !== "node") {
    return await import(path);
  }

  const pkgJSON = await getConsumerPackageJSON();

  if (pkgJSON.type === "module") {
    const { tsImport } = await import("tsx/esm/api");

    if (isWindows && !path.startsWith("file://")) {
      path = `file://${path}`;
    }

    return await tsImport(path, { parentURL: import.meta.url });
  }

  const { require: tsRequire } = await import("tsx/cjs/api");

  return await tsRequire(path, __filename);
}
