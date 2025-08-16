import { resolve } from 'node:path'
import database from 'better-sqlite3'
import { defineConfig } from 'kysely-ctl'

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: {
		database: database(resolve(__dirname, '../example.db')),
	},
})
