import { runtime } from "std-env";
import { tsImport } from "tsx/esm/api";

export async function importTSFile(path: string): Promise<any> {
  if (runtime === "node") {
    return await tsImport(path, { parentURL: import.meta.url });
  }

  return await import(path);
}
