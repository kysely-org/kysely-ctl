import { consola } from "consola";
import type { ArgsDef, CommandDef, SubCommandsDef } from "citty";
import { CommonArgs } from "../../arguments/common.mjs";
import { usingSeeder } from "../../seeds/using-seeder.mjs";

const args = {
  ...CommonArgs,
} satisfies ArgsDef;

export const ListCommand = {
  list: {
    meta: {
      name: "list",
      description: "List seeds",
    },
    args,
    async run(context) {
      consola.debug(context, []);

      const seeds = await usingSeeder(context.args, (seeder) =>
        seeder.getSeeds()
      );

      consola.debug(seeds);

      if (!seeds.length) {
        return consola.info("No seeds found.");
      }

      consola.info(`Found ${seeds.length} seed${seeds.length > 1 ? "s" : ""}:`);
      seeds.forEach((seed) => {
        consola.log(seed.name);
      });
    },
  } satisfies CommandDef<typeof args>,
} satisfies SubCommandsDef;
