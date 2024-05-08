import { type CommandDef, showUsage, type ArgsDef } from "citty";
import { consola, LogLevels } from "consola";
import {
  printInstalledVersions,
  printUpgradeNotice,
} from "../utils/version.mjs";
import { MigrateCommand } from "./migrate/root.mjs";
import { isInSubcommand } from "../utils/is-in-subcommand.mjs";
import { LegacyMakeCommand } from "./migrate/make.mjs";
import { LegacyListCommand } from "./migrate/list.mjs";
import { LegacyLatestCommand } from "./migrate/latest.mjs";
import { LegacyRollbackCommand } from "./migrate/rollback.mjs";
import { LegacyDownCommand } from "./migrate/down.mjs";
import { LegacyUpCommand } from "./migrate/up.mjs";

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
    ...LegacyDownCommand,
    ...LegacyLatestCommand,
    ...LegacyListCommand,
    ...LegacyMakeCommand,
    ...LegacyRollbackCommand,
    ...LegacyUpCommand,
    ...MigrateCommand,
  },
  setup(context) {
    if (context.args.debug) {
      consola.level = LogLevels.debug;
    }
  },
  async run(context) {
    if (!isInSubcommand(context)) {
      consola.debug(context, []);

      if (context.args.version) {
        return await printInstalledVersions();
      }

      await showUsage(context.cmd);
    }

    await printUpgradeNotice();
  },
} satisfies CommandDef<typeof args>;
