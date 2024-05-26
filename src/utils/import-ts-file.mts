import { runtime } from "std-env";
import { tsImport } from "tsx/esm/api";
import { require } from "tsx/cjs/api";
import { getConsumerPackageJSON } from "./pkg-json.mjs";

export async function importTSFile(path: string): Promise<any> {
  if (runtime === "node") {
    const pkgJSON = await getConsumerPackageJSON();

    if (pkgJSON.type === "module") {
      return await tsImport(path, { parentURL: import.meta.url });
    }

    return await require(path, __filename);
  }

  return await import(path);
}
