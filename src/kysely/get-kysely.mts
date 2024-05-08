import { Kysely } from "kysely";
import { getDialect } from "./get-dialect.mjs";
import { KyselyCTLConfig } from "../config/kysely-ctl-config.mjs";
import consola from "consola";

export async function getKysely<DB = any>(
  config: KyselyCTLConfig,
  debug: boolean = false
): Promise<Kysely<DB>> {
  return new Kysely<DB>({
    dialect: await getDialect(config),
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
