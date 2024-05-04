import { execSync } from "node:child_process";
import { readPackageJSON } from "pkg-types";
import { process } from "std-env";
import { ensureDependencyInstalled } from "nypm";
import { consola } from "consola";
import { getPackageManager } from "./package-manager.mjs";

/**
 * Returns the version of the Kysely package.
 */
export async function getKyselyInstalledVersion(): Promise<string | null> {
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
export async function getCLIInstalledVersion(): Promise<string> {
  const { version } = await readPackageJSON();

  if (!version) {
    throw new Error("Could not find the version of the CLI");
  }

  return version;
}

/**
 * Prints the version of the CLI and the Kysely package.
 */
export async function printInstalledVersions(): Promise<void> {
  const [cliVersion, kyselyVersion] = await Promise.all([
    getCLIInstalledVersion(),
    getKyselyInstalledVersion(),
  ]);

  console.log(
    `kysely ${kyselyVersion ? `v${kyselyVersion}` : "[not installed]"}`
  );
  console.log(`kysely-ctl v${cliVersion}`);
}

export async function assertKyselyInstalled(): Promise<void> {
  const isInstalled = await ensureDependencyInstalled("kysely", {
    cwd: process.cwd!(),
  });

  if (!isInstalled) {
    throw new Error("Kysely is not installed! aborting...");
  }
}

export async function getKyselyLatestVersion(): Promise<string | null> {
  return await getPackageLatestVersion("kysely");
}

export async function getCLILatestVersion(): Promise<string | null> {
  return await getPackageLatestVersion("kysely-ctl");
}

async function getPackageLatestVersion(
  packageName: string
): Promise<string | null> {
  const packageManager = await getPackageManager();

  if (packageManager.name === "bun") {
    return null;
  }

  if (packageManager.name === "deno") {
    packageName = `npm:${packageName}`;
  }

  const info = execSync(`${packageManager.command} info ${packageName}`, {
    cwd: process.cwd!(),
    encoding: "utf-8",
  });

  const [version] = info.match(/\d+\.\d+\.\d+/) || [];

  return version || null;
}

export async function printUpgradeNotice(): Promise<void> {
  const [
    kyselyInstalledVersion,
    kyselyLatestVersion,
    cliInstalledVersion,
    cliLatestVersion,
  ] = await Promise.all([
    getKyselyInstalledVersion(),
    getKyselyLatestVersion(),
    getCLIInstalledVersion(),
    getCLILatestVersion(),
  ]);

  const notices: [string, string, string][] = [];

  if (kyselyLatestVersion && kyselyInstalledVersion !== kyselyLatestVersion) {
    notices.push(["Kysely", "kysely", kyselyLatestVersion]);
  }

  if (cliLatestVersion && cliInstalledVersion !== cliLatestVersion) {
    notices.push(["KyselyCTL", "kysely-ctl", cliLatestVersion]);
  }

  const packageManager = await getPackageManager();

  const installCommand = {
    [packageManager.name]: "install",
    bun: "add",
    pnpm: "add",
    yarn: "add",
  }[packageManager.name];

  consola.box(
    notices
      .map(
        ([prettyName, name, latestVersion]) =>
          `A new version of ${prettyName} is available: v${latestVersion}\nRun \`${
            packageManager.command
          } ${installCommand} ${
            packageManager.name === "deno" ? "npm:" : ""
          }${name}@latest\` to upgrade.`
      )
      .join("\n\n")
  );
}
