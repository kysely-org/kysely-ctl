import { showUsage, type SubCommandsDef } from "citty";
import { consola } from "consola";
import { MakeCommand } from "./make.mjs";
import { isInSubcommand } from "../../utils/is-in-subcommand.mjs";
import { RootCommand } from "../root.mjs";
import { ListCommand } from "./list.mjs";
import { LatestCommand } from "./latest.mjs";
import { RollbackCommand } from "./rollback.mjs";
import { UpCommand } from "./up.mjs";
import { DownCommand } from "./down.mjs";
import { CommonArgs } from "../../arguments/common.mjs";

export const MigrateCommand = {
  migrate: {
    meta: {
      name: "migrate",
      description: "Migrate the database schema",
    },
    args: CommonArgs,
    subCommands: {
      ...DownCommand,
      ...LatestCommand,
      ...ListCommand,
      ...MakeCommand,
      ...RollbackCommand,
      ...UpCommand,
    },
    async run(context) {
      if (!isInSubcommand(context)) {
        consola.debug(context, []);

        await showUsage(context.cmd, RootCommand);
      }
    },
  },
} satisfies SubCommandsDef;
