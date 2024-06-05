import { copyFile, mkdir } from "node:fs/promises";
import type { ArgsDef, CommandDef } from "citty";
import { consola } from "consola";
import { join } from "pathe";
import { CommonArgs } from "../../arguments/common.mjs";
import { ExtensionArg, assertExtension } from "../../arguments/extension.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";
import { getConfigOrFail } from "../../config/get-config.mjs";

const args = {
  ...CommonArgs,
  ...ExtensionArg,
  seed_name: {
    description: "Seed file name to create",
    required: true,
    type: "positional",
  },
} satisfies ArgsDef;

const BaseMakeCommand = {
  meta: {
    description: "Create a new seed file",
  },
  args,
  async run(context) {
    const { args } = context;
    const { extension } = args;

    consola.debug(context, []);

    assertExtension(extension);

    const config = await getConfigOrFail(args);

    const seedsFolderPath = join(config.cwd, config.seeds.seedFolder);

    consola.debug("Seeds folder path:", seedsFolderPath);

    const wasSeedsFolderCreated = Boolean(
      await mkdir(seedsFolderPath, { recursive: true })
    );

    if (wasSeedsFolderCreated) {
      consola.debug("Seeds folder created");
    }

    const filename = `${await config.seeds.getSeedPrefix()}${
      args.seed_name
    }.${extension}`;

    consola.debug("Filename:", filename);

    const filePath = join(seedsFolderPath, filename);

    consola.debug("File path:", filePath);

    await copyFile(join(__dirname, "templates/seed-template.ts"), filePath);

    consola.success(`Created seed file at ${filePath}`);
  },
} satisfies CommandDef<typeof args>;

export const MakeCommand = createSubcommand("make", BaseMakeCommand);
export const LegacyMakeCommand = createSubcommand("seed:make", BaseMakeCommand);
