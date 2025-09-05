import { equal } from 'node:assert'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import database from 'better-sqlite3'
import { defineConfig } from 'kysely-ctl'

const __dirname = dirname(fileURLToPath(import.meta.url))

equal(process.env.ENABLE_LOGS, '1') // verifies envar loading works.

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: {
		database: database(resolve(__dirname, '../example.db')),
	},
})
