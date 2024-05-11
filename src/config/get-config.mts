import { loadConfig } from "c12";
import { consola } from "consola";
import type {
  KyselyCTLConfig,
  ResolvedKyselyCTLConfig,
} from "./kysely-ctl-config.mjs";
import { getCWD } from "./get-cwd.mjs";

type ArgsLike = {
  cwd?: string;
  environment?: string;
};

export async function getConfig(
  args: ArgsLike
): Promise<ResolvedKyselyCTLConfig> {
  const cwd = getCWD(args);

  const loadedConfig = await loadConfig<KyselyCTLConfig>({
    cwd,
    dotenv: true,
    envName: args.environment,
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

  return {
    ...config,
    cwd,
    migrations: {
      migrationFolder: "migrations",
      ...config.migrations,
    },
    plugins: config.plugins || [],
  };
}
