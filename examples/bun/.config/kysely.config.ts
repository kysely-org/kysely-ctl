// @ts-ignore no idea why it can't find the module despite @types/bun being installed
import { Database } from 'bun:sqlite'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	dialect: new BunSqliteDialect({
		database: new Database('./example.db'),
	}),
	migrations: {
		migrationFolder: '../../.migrations',
	},
})
