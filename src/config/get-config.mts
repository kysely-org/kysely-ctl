import { loadConfig } from "c12";
import { process } from "std-env";
import {
  DummyDriver,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import consola from "consola";
import { join } from "pathe";
import type { KyselyCTLConfig } from "./kysely-ctl-config.mjs";
import { TSFileMigrationProvider } from "../kysely/ts-file-migration-provider.mjs";

export async function getConfig(debug?: boolean): Promise<KyselyCTLConfig> {
  const cwd = process.cwd!();

  const loadedConfig = await loadConfig<KyselyCTLConfig>({
    cwd,
    defaults: {
      dialect: {
        createAdapter: () => new PostgresAdapter(),
        createDriver: () => new DummyDriver(),
        createIntrospector: (db) => new PostgresIntrospector(db),
        createQueryCompiler: () => new PostgresQueryCompiler(),
      },
      migrations: {
        provider: new TSFileMigrationProvider({
          migrationFolder: join(cwd, "migrations"),
        }),
      },
      plugins: [],
    },
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
