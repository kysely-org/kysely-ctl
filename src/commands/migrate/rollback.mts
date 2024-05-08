import { ArgsDef, CommandDef } from "citty";
import { DebugArg } from "../../arguments/debug.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { consola } from "consola";
import { NO_MIGRATIONS } from "kysely";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { EnvironmentArg } from "../../arguments/environment.mjs";

const args = {
  all: {
    description: "Rollback all completed migrations",
    required: true, // remove this if and when Migrator supports migration batches.
    type: "boolean",
  },
  ...DebugArg,
  ...EnvironmentArg,
} satisfies ArgsDef;

const BaseRollbackCommand = {
  meta: {
    name: "rollback",
    description: "Rollback all the completed migrations",
  },
  args,
  async run(context) {
    consola.debug(context, []);

    const config = await getConfig(context.args);

    const migrator = await getMigrator(config);

    consola.start("Starting migration rollback");

    const resultSet = await migrator.migrateTo(NO_MIGRATIONS);

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
      `Migration complete: rolled back ${results.length} migration${
        results.length > 1 ? "s" : ""
      }`
    );
  },
} satisfies CommandDef<typeof args>;

export const RollbackCommand = createSubcommand(
  "rollback",
  BaseRollbackCommand
);
export const LegacyRollbackCommand = createSubcommand(
  "migrate:rollback",
  BaseRollbackCommand
);
