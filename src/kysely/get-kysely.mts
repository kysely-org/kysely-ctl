import { Kysely } from "kysely";
import { getDialect } from "./get-dialect.mjs";
import { KyselyCTLConfig } from "../config/kysely-ctl-config.mjs";

export async function getKysely<DB = any>(
  config: KyselyCTLConfig
): Promise<Kysely<DB>> {
  const dialect = await getDialect(config);

  return new Kysely<DB>({
    dialect,
    plugins: config.plugins,
  });
}
