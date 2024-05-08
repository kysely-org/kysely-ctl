import type { ArgsDef, CommandDef } from "citty";
import { ensureDependencyInstalled } from "nypm";
import { process, runtime } from "std-env";
import { consola } from "consola";
import { DebugArg } from "../../arguments/debug.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { EnvironmentArg } from "../../arguments/environment.mjs";

const args = {
  ...DebugArg,
  ...EnvironmentArg,
} satisfies ArgsDef;

const BaseLatestCommand = {
  meta: {
    name: "latest",
    description: "Update the database schema to the latest version",
  },
  args,
  async run(context) {
    consola.debug(context, []);

    if (runtime === "node") {
      await ensureDependencyInstalled("kysely", { cwd: process.cwd!() });
    }

    const config = await getConfig(context.args);

    const migrator = await getMigrator(config);

    consola.start("Starting migration to latest");

    const resultSet = await migrator.migrateToLatest();

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
      return consola.info("Migration skipped: no new migrations found");
    }

    consola.success(
      `Migration complete: ran ${results.length} migration${
        results.length > 1 ? "s" : ""
      }`
    );
  },
} satisfies CommandDef<typeof args>;

export const LatestCommand = createSubcommand("latest", BaseLatestCommand);
export const LegacyLatestCommand = createSubcommand(
  "migrate:latest",
  BaseLatestCommand
);
