import { resolve } from 'node:path'
import database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	destroyOnExit: true,
	kysely: () =>
		new Kysely({
			dialect: new SqliteDialect({
				database: database(resolve(__dirname, '../example.db')),
			}),
		}),
	migrations: {
		allowJS: true,
	},
})
