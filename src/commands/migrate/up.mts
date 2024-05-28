import type { ArgsDef, CommandDef } from "citty";
import { consola } from "consola";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { createMigrationNameArg } from "../../arguments/migration-name.mjs";
import { CommonArgs } from "../../arguments/common.mjs";
import { processMigrationResultSet } from "../../kysely/process-migration-result-set.mjs";
import { isWrongDirection } from "../../kysely/is-wrong-direction.mjs";
import { usingMigrator } from "../../kysely/using-migrator.mjs";

const args = {
  ...CommonArgs,
  ...createMigrationNameArg(),
} satisfies ArgsDef;

const BaseUpCommand = {
  meta: {
    name: "up",
    description: "Run the next migration that has not yet been run",
  },
  args,
  async run(context) {
    const { args } = context;
    const { migration_name } = args;

    consola.debug(context, []);

    await usingMigrator(args, async (migrator) => {
      if (await isWrongDirection(migration_name, "up", migrator)) {
        return consola.info(
          `Migration skipped: migration "${migration_name}" has already been run`
        );
      }

      consola.start("Starting migration up");

      const resultSet = migration_name
        ? await migrator.migrateTo(migration_name)
        : await migrator.migrateUp();

      await processMigrationResultSet(resultSet, "up", migrator);
    });
  },
} satisfies CommandDef<typeof args>;

export const UpCommand = createSubcommand("up", BaseUpCommand);
export const LegacyUpCommand = createSubcommand("migrate:up", BaseUpCommand);
