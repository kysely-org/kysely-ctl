import {
  MssqlDialect,
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
  type Dialect,
} from "kysely";
import type { ResolvedKyselyCTLConfig } from "../config/kysely-ctl-config.mjs";

export async function getDialect(
  config: ResolvedKyselyCTLConfig
): Promise<Dialect> {
  if (config.dialect === "better-sqlite3") {
    return new SqliteDialect(config.dialectConfig);
  }

  if (config.dialect === "mysql2") {
    return new MysqlDialect(config.dialectConfig);
  }

  if (config.dialect === "pg") {
    return new PostgresDialect(config.dialectConfig);
  }

  if (config.dialect === "postgres") {
    return new (await import("kysely-postgres-js")).PostgresJSDialect(
      config.dialectConfig
    );
  }

  if (config.dialect === "tedious") {
    return new MssqlDialect(config.dialectConfig);
  }

  if (typeof config.dialect === "object") {
    return config.dialect;
  }

  // @ts-expect-error
  throw new Error(`Unknown dialect: ${config.dialect}`);
}
