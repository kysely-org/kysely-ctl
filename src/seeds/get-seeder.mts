import { join } from "pathe";
import type { ResolvedKyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import { getKysely } from "../kysely/get-kysely.mjs";
import { FileSeedProvider } from "./file-seed-provider.mjs";
import { Seeder } from "./seeder.mjs";

export async function getSeeder(
  config: ResolvedKyselyCTLConfig
): Promise<Seeder> {
  const kysely = await getKysely(config);

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
