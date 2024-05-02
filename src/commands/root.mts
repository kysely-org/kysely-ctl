import { type CommandDef, showUsage, runCommand } from "citty";
import { printVersions } from "../version.mjs";
import { MigrateCommand } from "./migrate/root.mjs";
import { isInSubcommand } from "../is-in-subcommand.js";
import { LegacyMakeCommand } from "./migrate/make.mjs";

export const RootCommand = {
  meta: {
    name: "kysely",
    description: "A command-line tool for Kysely",
  },
  args: {
    debug: {
      default: false,
      description: "Show debug information",
      type: "boolean",
    },
    version: {
      alias: "v",
      default: false,
      description: "Show version number",
      type: "boolean",
    },
  },
  subCommands: {
    ...MigrateCommand,
    ...LegacyMakeCommand,
  },
  async run(context) {
    const { args } = context;

    if (args.debug) {
      console.log(context);
    }

    if (isInSubcommand(context)) {
      return;
    }

    if (args.version) {
      await printVersions();
      return;
    }

    await showUsage(context.cmd);
  },
} satisfies CommandDef;
