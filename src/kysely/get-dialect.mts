import {
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
  type Dialect,
} from "kysely";
import type { ResolvedKyselyCTLConfig } from "../config/kysely-ctl-config.mjs";

export async function getDialect(
  config: ResolvedKyselyCTLConfig
): Promise<Dialect> {
  const { dialect } = config;

  if (dialect === "better-sqlite3") {
    return new SqliteDialect(config.dialectConfig);
  }

  if (dialect === "mysql2") {
    return new MysqlDialect(config.dialectConfig);
  }

  if (dialect === "pg") {
    return new PostgresDialect(config.dialectConfig);
  }

  if (dialect === "postgres") {
    return new (await import("kysely-postgres-js")).PostgresJSDialect(
      config.dialectConfig
    );
  }

  if (dialect === "tedious") {
    // since it was introduced only in kysely v0.27.0
    // and we want to support older versions too
    return new (await import("kysely")).MssqlDialect(config.dialectConfig);
  }

  if (typeof dialect === "object") {
    return config.dialect;
  }

  // @ts-expect-error
  throw new Error(`Unknown dialect: ${config.dialect}`);
}
