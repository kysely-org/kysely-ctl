import type { ArgsDef, CommandDef } from "citty";
import { consola } from "consola";
import { NO_MIGRATIONS } from "kysely";
import { getConfigOrFail } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { CommonArgs } from "../../arguments/common.mjs";
import { processMigrationResultSet } from "../../kysely/process-migration-result-set.mjs";

const args = {
  all: {
    description: "Rollback all completed migrations",
    required: true, // remove this if and when Migrator supports migration batches.
    type: "boolean",
  },
  ...CommonArgs,
} satisfies ArgsDef;

const BaseRollbackCommand = {
  meta: {
    name: "rollback",
    description: "Rollback all the completed migrations",
  },
  args,
  async run(context) {
    consola.debug(context, []);

    const config = await getConfigOrFail(context.args);

    const migrator = await getMigrator(config);

    consola.start("Starting migration rollback");

    const resultSet = await migrator.migrateTo(NO_MIGRATIONS);

    await processMigrationResultSet(resultSet, "down", migrator);
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
