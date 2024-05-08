import type { ArgsDef, CommandDef } from "citty";
import { ensureDependencyInstalled } from "nypm";
import { runtime } from "std-env";
import { consola } from "consola";
import { DebugArg } from "../../arguments/debug.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { createMigrationNameArg } from "../../arguments/migration-name.mjs";
import { EnvironmentArg } from "../../arguments/environment.mjs";

const args = {
  ...createMigrationNameArg(),
  ...DebugArg,
  ...EnvironmentArg,
} satisfies ArgsDef;

const BaseDownCommand = {
  meta: {
    name: "down",
    description: "Undo the last/specified migration that was run",
  },
  args,
  async run(context) {
    const { migration_name } = context.args;

    consola.debug(context, []);

    if (runtime === "node") {
      await ensureDependencyInstalled("kysely", { cwd: process.cwd!() });
    }

    const config = await getConfig(context.args);

    const migrator = await getMigrator(config);

    consola.start("Starting migration down");

    const resultSet = migration_name
      ? await migrator.migrateTo(migration_name) // TODO: verify direction is down!
      : await migrator.migrateDown();

    consola.debug(resultSet);

    const { error, results } = resultSet;

    if (error) {
      const failedMigration = results?.find(
        (result) => result.status === "Error"
      );

      return consola.fail(
        `Migration failed with \`${error}\`${
          failedMigration ? ` @ "${failedMigration.migrationName}"` : ""
        }`
      );
    }

    if (!results?.length) {
      return consola.info("Migration skipped: no completed migrations found");
    }

    consola.success(
      `Migration complete: undone ${results.length} migration${
        results.length > 1 ? "s" : ""
      }`
    );
  },
} satisfies CommandDef<typeof args>;

export const DownCommand = createSubcommand("down", BaseDownCommand);
export const LegacyDownCommand = createSubcommand(
  "migrate:down",
  BaseDownCommand
);
