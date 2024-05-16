import { execSync } from "node:child_process";
import { type PackageJson, readPackageJSON } from "pkg-types";
import { consola } from "consola";
import { isCI } from "std-env";
import { getPackageManager } from "./package-manager.mjs";
import { type HasCWD, getCWD } from "../config/get-cwd.mjs";

/**
 * Returns the version of the Kysely package.
 */
export async function getKyselyInstalledVersion(
  args: HasCWD
): Promise<string | null> {
  try {
    const pkgJSON = await readPackageJSON("kysely", {
      startingFrom: getCWD(args),
    });

    return getVersionFromPackageJSON("kysely", pkgJSON);
  } catch (err) {
    return null;
  }
}

/**
 * Returns the version of this package.
 */
export async function getCLIInstalledVersion(): Promise<string | null> {
  try {
    const pkgJSON = await readPackageJSON("kysely-ctl", {
      startingFrom: __dirname,
    });

    return getVersionFromPackageJSON("kysely-ctl", pkgJSON);
  } catch (err) {
    return null;
  }
}

function getVersionFromPackageJSON(
  name: string,
  pkgJSON: PackageJson
): string | null {
  if (pkgJSON.name === name) {
    return pkgJSON.version || null;
  }

  const rawVersion =
    pkgJSON.dependencies?.[name] || pkgJSON.devDependencies?.[name];

  return rawVersion?.replace(/^[\^~]?(.+)$/, "$1") || null;
}

/**
 * Prints the version of the CLI and the Kysely package.
 */
export async function printInstalledVersions(args: HasCWD): Promise<void> {
  const [cliVersion, kyselyVersion] = await Promise.all([
    getCLIInstalledVersion(),
    getKyselyInstalledVersion(args),
  ]);

  console.log(
    `kysely ${kyselyVersion ? `v${kyselyVersion}` : "[not installed]"}`
  );
  console.log(`kysely-ctl v${cliVersion}`);
}

export async function getKyselyLatestVersion(
  args: HasCWD
): Promise<string | null> {
  return await getPackageLatestVersion("kysely", args);
}

export async function getCLILatestVersion(
  args: HasCWD
): Promise<string | null> {
  return await getPackageLatestVersion("kysely-ctl", args);
}

async function getPackageLatestVersion(
  packageName: string,
  args: HasCWD
): Promise<string | null> {
  const packageManager = await getPackageManager(args);

  if (packageManager.name === "bun") {
    packageManager.command = "bunx npm";
  }

  if (packageManager.name === "deno") {
    packageName = `npm:${packageName}`;
  }

  const info = execSync(`${packageManager.command} info ${packageName}`, {
    cwd: getCWD(args),
    encoding: "utf-8",
  });

  const [version] = info.match(/\d+\.\d+\.\d+/) || [];

  return version || null;
}

export async function printUpgradeNotice(
  args: HasCWD & { "outdated-check"?: boolean }
): Promise<void> {
  if (args["outdated-check"] === false || isCI) {
    return;
  }

  const [
    kyselyInstalledVersion,
    kyselyLatestVersion,
    cliInstalledVersion,
    cliLatestVersion,
  ] = await Promise.all([
    getKyselyInstalledVersion(args),
    getKyselyLatestVersion(args),
    getCLIInstalledVersion(),
    getCLILatestVersion(args),
  ]);

  const notices: [string, string, string][] = [];

  if (kyselyLatestVersion && kyselyInstalledVersion !== kyselyLatestVersion) {
    notices.push(["Kysely", "kysely", kyselyLatestVersion]);
  }

  if (cliLatestVersion && cliInstalledVersion !== cliLatestVersion) {
    notices.push(["KyselyCTL", "kysely-ctl", cliLatestVersion]);
  }

  if (!notices.length) {
    return;
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
