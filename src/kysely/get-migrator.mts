import { Migrator } from "kysely";
import { join } from "pathe";
import { process } from "std-env";
import type { KyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import { getKysely } from "./get-kysely.mjs";
import { TSFileMigrationProvider } from "./ts-file-migration-provider.mjs";

export async function getMigrator(config: KyselyCTLConfig) {
  const kysely = await getKysely(config);

  const { migrationFolder, migrator, provider, ...migrations } =
    config.migrations || {};

  return (
    migrator ||
    new Migrator({
      db: kysely,
      ...migrations,
      provider:
        provider ||
        new TSFileMigrationProvider({
          migrationFolder: join(
            process.cwd!(),
            migrationFolder || "migrations"
          ),
        }),
    })
  );
}
