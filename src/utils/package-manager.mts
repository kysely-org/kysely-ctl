import { isBun, isDeno, process } from "std-env";
import { detectPackageManager, type PackageManager } from "nypm";

export interface EnrichedPackageManager {
  name: PackageManager["name"] | "deno";
  command: PackageManager["command"] | "deno";
  inProject: boolean;
}

export async function getPackageManager(): Promise<EnrichedPackageManager> {
  const packageManager = await detectPackageManager(process.cwd!(), {
    ignoreArgv: true,
    includeParentDirs: true,
  });

  if (packageManager) {
    return { ...packageManager, inProject: true };
  }

  const name = isDeno ? "deno" : isBun ? "bun" : "npm";

  return { name, command: name, inProject: false };
}
