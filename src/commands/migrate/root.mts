import { showUsage, type SubCommandsDef } from "citty";
import { MakeCommand } from "./make.mjs";
import { isInSubcommand } from "../../is-in-subcommand.js";
import { RootCommand } from "../root.mjs";
import { DebugArg } from "../../arguments/debug.mjs";

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
    },
    async run(context) {
      if (context.args.debug) {
        console.log(context);
      }

      if (!isInSubcommand(context)) {
        await showUsage(context.cmd, RootCommand);
      }
    },
  },
} satisfies SubCommandsDef;
