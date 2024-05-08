import { loadConfig } from "c12";
import { process } from "std-env";
import consola from "consola";
import type { KyselyCTLConfig } from "./kysely-ctl-config.mjs";

type HasEnvironment = { environment: string };

export async function getConfig(
  args?: HasEnvironment
): Promise<KyselyCTLConfig> {
  const cwd = process.cwd!();

  const loadedConfig = await loadConfig<KyselyCTLConfig>({
    cwd,
    dotenv: true,
    envName: args?.environment,
    globalRc: false,
    name: "kysely",
    packageJson: false,
    rcFile: false,
  });

  consola.debug(loadedConfig);

  const { config } = loadedConfig;

  if (!config) {
    throw new Error("Could not find a configuration file");
  }

  return config;
}
