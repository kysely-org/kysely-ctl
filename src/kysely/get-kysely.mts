import { Kysely } from "kysely";
import { getDialect } from "./get-dialect.mjs";
import { KyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import consola from "consola";

export async function getKysely<DB = any>(
  config: KyselyCTLConfig,
  debug: boolean = false
): Promise<Kysely<DB>> {
  const dialect = await getDialect(config);

  return new Kysely<DB>({
    dialect,
    log: debug
      ? (event) => {
          if (event.level === "error") {
            return consola.error(event.error);
          }

          return consola.log(
            `executed \`${event.query.sql}\` in ${event.queryDurationMillis}ms`
          );
        }
      : [],
    plugins: config.plugins,
  });
}
