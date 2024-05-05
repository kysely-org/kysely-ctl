import { showUsage, type SubCommandsDef } from "citty";
import { consola } from "consola";
import { MakeCommand } from "./make.mjs";
import { isInSubcommand } from "../../utils/is-in-subcommand.mjs";
import { RootCommand } from "../root.mjs";
import { DebugArg } from "../../arguments/debug.mjs";
import { LatestCommand } from "./latest.mjs";

export const MigrateCommand = {
  migrate: {
    meta: {
      name: "migrate",
      description: "Migrate the database schema",
    },
    args: {
      debug: DebugArg,
    },
    subCommands: {
      ...MakeCommand,
      ...LatestCommand,
    },
    async run(context) {
      if (!isInSubcommand(context)) {
        if (context.args.debug) {
          consola.log(context);
        }

        await showUsage(context.cmd, RootCommand);
      }
    },
  },
} satisfies SubCommandsDef;