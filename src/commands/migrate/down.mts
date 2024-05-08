import type { ArgsDef, CommandDef } from "citty";
import { DebugArg } from "../../arguments/debug.mjs";
import { ensureDependencyInstalled } from "nypm";
import { runtime } from "std-env";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { consola } from "consola";
import { createMigrationNameArg } from "../../arguments/migration-name.mjs";

const args = {
  ...createMigrationNameArg(true),
  ...DebugArg,
} satisfies ArgsDef;

const BaseDownCommand = {
  meta: {
    name: "down",
    description: "Undo the last/specified migration that was run",
  },
  args,
  async run(context) {
    const { debug, migration_name } = context.args;

    if (debug) {
      console.log(context);
    }

    if (runtime === "node") {
      await ensureDependencyInstalled("kysely", { cwd: process.cwd!() });
    }

    const config = await getConfig(debug);

    const migrator = await getMigrator(config);

    consola.start("Starting migration down");

    const resultSet = migration_name
      ? await migrator.migrateTo(migration_name) // TODO: verify direction is down!
      : await migrator.migrateDown();

    if (debug) {
      consola.log(resultSet);
    }

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
