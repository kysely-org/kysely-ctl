import type { ArgsDef, CommandDef } from "citty";
import { consola } from "consola";
import { colorize } from "consola/utils";
import { CommonArgs } from "../../arguments/common.mjs";
import { getConfigOrFail } from "../../config/get-config.mjs";
import { getSeeder } from "../../seeds/get-seeder.mjs";
import { createSubcommand } from "../../utils/create-subcommand.mjs";

const args = {
  ...CommonArgs,
  specific: {
    description: "Run seed file/s with given name/s",
    type: "string",
  },
} satisfies ArgsDef;

const BaseRunCommand = {
  meta: {
    description: "Run seed files",
    name: "run",
  },
  args,
  async run(context) {
    const { args } = context;
    const { specific } = args;

    consola.debug(context, []);

    const config = await getConfigOrFail(args);

    const seeder = await getSeeder(config);

    consola.start("Starting seed run");

    const resultSet = specific
      ? await seeder.run(specific)
      : await seeder.run();

    consola.debug(resultSet);

    const { error, results } = resultSet;

    if (!results.length) {
      return consola.info("No seeds found.");
    }

    if (!error) {
      consola.success("Seed successful");
    }

    const actuallyRan = error
      ? results.filter((result) => result.status !== "NotExecuted")
      : results;

    consola.info(
      `Ran ${actuallyRan.length} seed${actuallyRan.length > 1 ? "s" : ""}:`
    );

    results.forEach((result) => {
      consola.log(
        `[${
          {
            Error: colorize("red", "✗"),
            NotExecuted: " ",
            Success: colorize("green", "✓"),
          }[result.status]
        }] ${result.seedName}${
          error && result.status === "Error" ? ` - ${error}` : ""
        }`
      );
    });
  },
} satisfies CommandDef<typeof args>;

export const RunCommand = createSubcommand("run", BaseRunCommand);
export const LegacyRunCommand = createSubcommand("seed:run", BaseRunCommand);
