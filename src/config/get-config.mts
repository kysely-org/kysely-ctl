import { loadConfig } from "c12";
import { process } from "std-env";
import type { KyselyCTLConfig } from "./kysely-ctl-config.mjs";
import consola from "consola";

export async function getConfig(debug?: boolean): Promise<KyselyCTLConfig> {
  const loadedConfig = await loadConfig<KyselyCTLConfig>({
    cwd: process.cwd!(),
    dotenv: true,
    globalRc: false,
    name: "kysely",
    packageJson: false,
    rcFile: false,
  });

  if (debug) {
    consola.log(loadedConfig);
  }

  const { config } = loadedConfig;

  if (!config) {
    throw new Error("Could not find a configuration file");
  }

  return config;
}
