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
  ...createMigrationNameArg(),
  ...DebugArg,
} satisfies ArgsDef;

const BaseUpCommand = {
  meta: {
    name: "up",
    description: "Run the next migration that has not yet been run",
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

    consola.start("Starting migration up");

    const resultSet = migration_name
      ? await migrator.migrateTo(migration_name) // TODO: verify direction is up!
      : await migrator.migrateUp();

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
      return consola.info("Migration skipped: no new migrations found");
    }

    consola.success(
      `Migration complete: ran ${results.length} migration${
        results.length > 1 ? "s" : ""
      }`
    );
  },
} satisfies CommandDef<typeof args>;

export const UpCommand = createSubcommand("up", BaseUpCommand);
export const LegacyUpCommand = createSubcommand("migrate:up", BaseUpCommand);
