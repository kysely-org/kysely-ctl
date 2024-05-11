import type { ArgsDef, CommandDef } from "citty";
import { consola } from "consola";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { getMigrator } from "../../kysely/get-migrator.mjs";
import { CommonArgs } from "../../arguments/common.mjs";
import { getMigrations } from "../../kysely/get-migrations.mjs";

const args = {
  ...CommonArgs,
} satisfies ArgsDef;

const BaseListCommand = {
  meta: {
    name: "list",
    description: "List both completed and pending migrations",
  },
  args,
  async run(context) {
    consola.debug(context, []);

    const config = await getConfig(context.args);

    const migrator = await getMigrator(config);

    const migrations = await getMigrations(migrator);

    consola.debug(migrations);

    if (!migrations.length) {
      return consola.info("No migrations found.");
    }

    consola.info(
      `Found ${migrations.length} migration${migrations.length > 1 ? "s" : ""}:`
    );
    migrations.forEach((migration) => {
      consola.log(`[${migration.executedAt ? "`✓`" : " "}] ${migration.name}`);
    });
  },
} satisfies CommandDef<typeof args>;

export const ListCommand = createSubcommand("list", BaseListCommand);
export const LegacyListCommand = createSubcommand(
  "migrate:list",
  BaseListCommand
);
