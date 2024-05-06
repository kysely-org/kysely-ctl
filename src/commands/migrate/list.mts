import type { ArgsDef, CommandDef } from "citty";
import consola from "consola";
import { ensureDependencyInstalled } from "nypm";
import { process, runtime } from "std-env";
import { DebugArg } from "../../arguments/debug.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";

const args = {
  debug: DebugArg,
} satisfies ArgsDef;

const BaseListCommand = {
  meta: {
    name: "list",
    description: "List both completed and pending migrations",
  },
  args,
  async run(context) {
    const { debug } = context.args;

    if (debug) {
      console.log(context);
    }

    if (runtime === "node") {
      await ensureDependencyInstalled("kysely", { cwd: process.cwd!() });
    }

    const config = await getConfig(debug);

    const migrator = await getMigrator(config);

    const migrations = await migrator.getMigrations();

    if (debug) {
      console.log(migrations);
    }

    if (!migrations.length) {
      return consola.info("No migrations found.");
    }

    consola.info(`Found ${migrations.length} migrations:`);
    migrations.forEach((migration) => {
      consola.options.formatOptions.date = false;
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
