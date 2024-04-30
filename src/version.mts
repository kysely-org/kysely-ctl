import { readPackageJSON } from "pkg-types";

/**
 * Returns the version of the Kysely package.
 */
export async function getKyselyVersion(): Promise<string | null> {
  try {
    const { version } = await readPackageJSON("kysely", {
      reverse: true,
    });

    return version || null;
  } catch (err) {
    return null;
  }
}

/**
 * Returns the version of this package.
 */
export async function getCLIVersion(): Promise<string> {
  const { version } = await readPackageJSON();

  if (!version) {
    throw new Error("Could not find the version of the CLI");
  }

  return version;
}
