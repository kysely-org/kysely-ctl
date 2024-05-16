import { showUsage, type SubCommandsDef } from "citty";
import { consola } from "consola";
import { CommonArgs } from "../../arguments/common.mjs";
import { isInSubcommand } from "../../utils/is-in-subcommand.mjs";
import { RootCommand } from "../root.mjs";
import { MakeCommand } from "./make.mjs";

export const SeedCommand = {
  seed: {
    meta: {
      name: "seed",
      description:
        "Populate your database with test or seed data independent of your migration files",
    },
    args: CommonArgs,
    subCommands: {
      ...MakeCommand,
    },
    async run(context) {
      if (!isInSubcommand(context)) {
        consola.debug(context, []);

        await showUsage(context.cmd, RootCommand);
      }
    },
  },
} satisfies SubCommandsDef;
