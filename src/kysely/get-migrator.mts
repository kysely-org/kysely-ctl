import { Migrator } from "kysely";
import { join } from "pathe";
import { process } from "std-env";
import type { KyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import { getKysely } from "./get-kysely.mjs";
import { TSFileMigrationProvider } from "./ts-file-migration-provider.mjs";

export async function getMigrator(config: KyselyCTLConfig) {
  const kysely = await getKysely(config);

  const migrationFolder = join(process.cwd!(), "migrations");

  return new Migrator({
    db: kysely,
    provider:
      config.migrations?.provider ||
      new TSFileMigrationProvider({ migrationFolder }),
  });
}
