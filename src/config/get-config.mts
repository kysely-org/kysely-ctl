import { loadConfig } from "c12";
import { consola } from "consola";
import type {
  KyselyCTLConfig,
  ResolvedKyselyCTLConfig,
} from "./kysely-ctl-config.mjs";
import { getCWD } from "./get-cwd.mjs";
import { getMillisPrefix } from "./get-file-prefix.mjs";

export interface ArgsLike {
  cwd?: string;
  environment?: string;
}

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

  const { config, ...configMetadata } = loadedConfig;

  return {
    ...(config || {}),
    configMetadata,
    cwd,
    dialect: config?.dialect || {
      createAdapter() {
        throw new Error("No dialect specified");
      },
      createDriver() {
        throw new Error("No dialect specified");
      },
      createIntrospector() {
        throw new Error("No dialect specified");
      },
      createQueryCompiler() {
        throw new Error("No dialect specified");
      },
    },
    // @ts-ignore
    dialectConfig: config?.dialectConfig || {},
    migrations: {
      getMigrationPrefix: getMillisPrefix,
      migrationFolder: "migrations",
      ...config?.migrations,
    },
    plugins: config?.plugins || [],
    seeds: {
      getSeedPrefix: getMillisPrefix,
      seedFolder: "seeds",
      ...config?.seeds,
    },
  };
}

export function configFileExists(config: ResolvedKyselyCTLConfig): boolean {
  const { configFile } = config.configMetadata;

  return configFile !== undefined && configFile !== "kysely.config";
}

export async function getConfigOrFail(
  args: ArgsLike
): Promise<ResolvedKyselyCTLConfig> {
  const config = await getConfig(args);

  if (!configFileExists(config)) {
    throw new Error("No config file found");
  }

  return config;
}
