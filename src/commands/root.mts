import { type CommandDef, showUsage, type ArgsDef } from "citty";
import { printVersions } from "../utils/version.mjs";
import { MigrateCommand } from "./migrate/root.mjs";
import { isInSubcommand } from "../utils/is-in-subcommand.mjs";
import { LegacyMakeCommand } from "./migrate/make.mjs";

const args = {
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
} satisfies ArgsDef;

export const RootCommand = {
  meta: {
    name: "kysely",
    description: "A command-line tool for Kysely",
  },
  args,
  subCommands: {
    ...MigrateCommand,
    ...LegacyMakeCommand,
  },
  async run(context) {
    if (isInSubcommand(context)) {
      return;
    }

    const { args } = context;

    if (args.debug) {
      console.log(context);
    }

    if (args.version) {
      return await printVersions();
    }

    await showUsage(context.cmd);
  },
} satisfies CommandDef<typeof args>;
