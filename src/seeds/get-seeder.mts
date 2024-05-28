import { join } from "pathe";
import type { ResolvedKyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import { FileSeedProvider } from "./file-seed-provider.mjs";
import { Seeder } from "./seeder.mjs";
import type { Kysely } from "kysely";

export function getSeeder(
  kysely: Kysely<any>,
  config: ResolvedKyselyCTLConfig
): Seeder {
  const { seedFolder, seeder, provider, ...seeds } = config.seeds;

  return (
    seeder ||
    new Seeder({
      db: kysely,
      ...seeds,
      provider:
        provider ||
        new FileSeedProvider({
          seedFolder: join(config.cwd, seedFolder),
        }),
    })
  );
}
