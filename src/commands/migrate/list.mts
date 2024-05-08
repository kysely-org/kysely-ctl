import type { ArgsDef, CommandDef } from "citty";
import consola from "consola";
import { ensureDependencyInstalled } from "nypm";
import { process, runtime } from "std-env";
import { DebugArg } from "../../arguments/debug.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { EnvironmentArg } from "../../arguments/environment.mjs";

const args = {
  ...DebugArg,
  ...EnvironmentArg,
} satisfies ArgsDef;

const BaseListCommand = {
  meta: {
    name: "list",
    description: "List both completed and pending migrations",
  },
  args,
  async run(context) {
    consola.debug(context, []);

    if (runtime === "node") {
      await ensureDependencyInstalled("kysely", { cwd: process.cwd!() });
    }

    const config = await getConfig(context.args);

    const migrator = await getMigrator(config);

    const migrations = await migrator.getMigrations();

    consola.debug(migrations);

    if (!migrations.length) {
      return consola.info("No migrations found.");
    }

    consola.info(
      `Found ${migrations.length} migration${migrations.length > 1 ? "s" : ""}:`
    );
    consola.options.formatOptions.date = false;
    migrations.forEach((migration) => {
      consola.log(`[${migration.executedAt ? "X" : " "}] ${migration.name}`);
    });
    consola.options.formatOptions.date = true;
  },
} satisfies CommandDef<typeof args>;

export const ListCommand = createSubcommand("list", BaseListCommand);
export const LegacyListCommand = createSubcommand(
  "migrate:list",
  BaseListCommand
);
