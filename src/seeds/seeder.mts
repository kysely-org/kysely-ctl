import type { Kysely } from "kysely";

export class Seeder {
  #props: SeederProps;

  constructor(props: SeederProps) {
    this.#props = props;
  }

  async getSeeds(seedNames?: string | string[]): Promise<SeedInfo[]> {
    const seeds = await this.#props.provider.getSeeds(seedNames);

    return Object.entries(seeds).map(([name, seed]) => ({
      name,
      seed,
    }));
  }

  async run(seedNames?: string | string[]): Promise<SeedResultSet> {
    const seeds = await this.getSeeds(seedNames);

    const resultSet = {
      error: undefined as unknown,
      results: seeds.map(
        (seed) =>
          ({
            seedName: seed.name,
            status: "NotExecuted" as SeedResult["status"],
          } satisfies SeedResult)
      ),
    };

    for (let i = 0, len = seeds.length; i < len && !resultSet.error; ++i) {
      try {
        await seeds[i].seed.seed(this.#props.db);
        resultSet.results[i].status = "Success";
      } catch (err) {
        resultSet.results[i].status = "Error";
        resultSet.error = err;
      }
    }

    return resultSet;
  }
}

export interface Seed {
  seed(db: Kysely<any>): Promise<void>;
}

export interface SeedProvider {
  getSeeds(seedNames?: string | string[]): Promise<Record<string, Seed>>;
}

export interface SeederProps {
  db: Kysely<any>;
  provider: SeedProvider;
}

export interface SeedInfo {
  name: string;
  seed: Seed;
}

export interface SeedResultSet {
  readonly error?: unknown;
  readonly results: SeedResult[];
}

export interface SeedResult {
  readonly seedName: string;
  readonly status: "Success" | "Error" | "NotExecuted";
}
