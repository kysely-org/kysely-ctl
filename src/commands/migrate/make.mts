import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { ArgsDef, CommandDef } from "citty";
import { join } from "pathe";
import { consola } from "consola";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { createMigrationNameArg } from "../../arguments/migration-name.mjs";
import { getConfig } from "../../config/get-config.mjs";
import { CommonArgs } from "../../arguments/common.mjs";

const args = {
  ...CommonArgs,
  ...createMigrationNameArg(true),
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

    consola.debug(context, []);

    const timestamp = Date.now();

    consola.debug("Timestamp:", timestamp);

    const config = await getConfig(args);

    const migrationsFolderPath = join(
      config.cwd,
      config.migrations.migrationFolder
    );

    consola.debug("Migrations folder path:", migrationsFolderPath);

    const wasMigrationsFolderCreated = Boolean(
      await mkdir(migrationsFolderPath, {
        recursive: true,
      })
    );

    if (wasMigrationsFolderCreated) {
      consola.debug("Migrations folder created");
    }

    const filename = `${timestamp}_${args.migration_name}.${args.extension}`;

    consola.debug("Filename:", filename);

    const filePath = join(migrationsFolderPath, filename);

    consola.debug("File path:", filePath);

    const migrationTemplate = await readFile(
      join(__dirname, "templates/migration-template.ts")
    );

    await writeFile(filePath, migrationTemplate);

    consola.success(`Created migration file at ${filePath}`);
  },
} satisfies CommandDef<typeof args>;

export const MakeCommand = createSubcommand("make", BaseMakeCommand);
export const LegacyMakeCommand = createSubcommand(
  "migrate:make",
  BaseMakeCommand
);
