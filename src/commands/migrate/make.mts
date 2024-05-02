import type { CommandContext, CommandDef } from "citty";
import { DebugArg } from "../../arguments/debug.mjs";

const BaseMakeCommand = {
  meta: {
    description: "Create a new migration file",
  },
  args: {
    migration_name: {
      description: "The name of the migration file",
      type: "positional",
    },
    debug: DebugArg,
    extension: {
      alias: "x",
      default: "ts",
      description: "The file extension to use",
      type: "string",
      valueHint: '"ts" | "mts" | "cts"',
    },
  },
  setup(context: CommandContext) {
    const { extension } = context.args;

    if (!["ts", "mts", "cts"].includes(extension as string)) {
      throw new Error(
        `Invalid file extension "${context.args.extension}"! Expected ${BaseMakeCommand.args.extension.valueHint}`
      );
    }
  },
  async run(context: CommandContext): Promise<any> {
    const { args } = context;

    if (args.debug) {
      console.log(context);
    }

    // TODO: generate file...
  },
} satisfies CommandDef;

function createMakeCommand<Name extends string>(
  name: Name
): { [Key in Name]: typeof BaseMakeCommand } {
  return {
    [name]: {
      ...BaseMakeCommand,
      meta: {
        ...BaseMakeCommand.meta,
        name,
      },
    },
  } as any;
}

export const MakeCommand = createMakeCommand("make");
export const LegacyMakeCommand = createMakeCommand("migrate:make");
