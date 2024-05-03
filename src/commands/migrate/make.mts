import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { ArgsDef, CommandDef, SubCommandsDef } from "citty";
import { process } from "std-env";
import { join } from "pathe";
import { consola } from "consola";
import { DebugArg } from "../../arguments/debug.mjs";

const args = {
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
} satisfies ArgsDef;

const BaseMakeCommand = {
  meta: {
    description: "Create a new migration file",
  },
  args,
  setup(context) {
    const { extension } = context.args;

    if (!["ts", "mts", "cts"].includes(extension)) {
      throw new Error(
        `Invalid file extension "${context.args.extension}"! Expected ${BaseMakeCommand.args.extension.valueHint}`
      );
    }
  },
  async run(context) {
    const { args } = context;
    const { debug } = args;

    if (debug) {
      consola.log(context);
    }

    const timestamp = Date.now();

    if (args.debug) {
      consola.log("Timestamp:", timestamp);
    }

    const migrationsFolderPath = join(process.cwd!(), "migrations");

    if (args.debug) {
      consola.log("Migrations folder path:", migrationsFolderPath);
    }

    const wasMigrationsFolderCreated = Boolean(
      await mkdir(migrationsFolderPath, {
        recursive: true,
      })
    );

    if (args.debug && wasMigrationsFolderCreated) {
      consola.log("Migrations folder created");
    }

    const filename = `${timestamp}_${args.migration_name}.${args.extension}`;

    if (args.debug) {
      consola.log("Filename:", filename);
    }

    const filePath = join(migrationsFolderPath, filename);

    if (args.debug) {
      consola.log("File path:", filePath);
    }

    const migrationTemplate = await readFile(
      join(__dirname, "templates/migration-template.ts")
    );

    await writeFile(filePath, migrationTemplate);

    consola.success(`Created migration file at ${filePath}`);
  },
} satisfies CommandDef<typeof args>;

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
  } satisfies SubCommandsDef as any;
}

export const MakeCommand = createMakeCommand("make");
export const LegacyMakeCommand = createMakeCommand("migrate:make");
