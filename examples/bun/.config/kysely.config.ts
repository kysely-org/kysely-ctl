import { defineConfig } from "kysely-ctl";
import { Database } from "bun:sqlite";
import { BunSqliteDialect } from "kysely-bun-sqlite";

export default defineConfig({
  dialect: new BunSqliteDialect({
    database: new Database("./example.db"),
  }),
});
