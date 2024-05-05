import type {
  Dialect as KyselyDialectInstance,
  KyselyPlugin,
  MigrationProvider,
  MssqlDialectConfig,
  MysqlDialectConfig,
  PostgresDialectConfig,
  SqliteDialectConfig,
} from "kysely";
import type { PostgresJSDialectConfig } from "kysely-postgres-js";

export type KyselyDialect =
  | KyselyCoreDialect
  | KyselyOrganizationDialect
  | KyselyDialectInstance;
export type ResolvableKyselyDialect =
  | KyselyCoreDialect
  | KyselyOrganizationDialect;
export type KyselyCoreDialect = "pg" | "mysql2" | "tedious" | "better-sqlite3";
export type KyselyOrganizationDialect = "postgres";

interface KyselyDialectConfigDictionary
  extends Record<ResolvableKyselyDialect, unknown> {
  "better-sqlite3": SqliteDialectConfig;
  mysql2: MysqlDialectConfig;
  pg: PostgresDialectConfig;
  postgres: PostgresJSDialectConfig;
  tedious: MssqlDialectConfig;
}

export type KyselyDialectConfig<Dialect extends KyselyDialect> =
  Dialect extends ResolvableKyselyDialect
    ? KyselyDialectConfigDictionary[Dialect]
    : never;

export type KyselyCTLConfig<Dialect extends KyselyDialect = KyselyDialect> =
  KyselyCTLConfigBase &
    (Dialect extends ResolvableKyselyDialect
      ? {
          dialect: Dialect;
          dialectConfig: KyselyDialectConfig<Dialect>;
        }
      : {
          dialect: Dialect;
        });

export interface KyselyCTLConfigBase {
  migrations?: {
    provider?: MigrationProvider;
  };
  plugins?: KyselyPlugin[];
}
