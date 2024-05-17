import { Migrator } from "kysely";
import { join } from "pathe";
import type { ResolvedKyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import { getKysely } from "./get-kysely.mjs";
import { TSFileMigrationProvider } from "./ts-file-migration-provider.mjs";

export async function getMigrator(
  config: ResolvedKyselyCTLConfig
): Promise<Migrator> {
  const kysely = await getKysely(config);

  const { migrationFolder, migrator, provider, ...migrations } =
    config.migrations;

  return (
    migrator ||
    new Migrator({
      db: kysely,
      ...migrations,
      provider:
        provider ||
        new TSFileMigrationProvider({
          migrationFolder: join(config.cwd, migrationFolder),
        }),
    })
  );
}
