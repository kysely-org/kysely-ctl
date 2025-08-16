import { dirname, resolve } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import database from 'better-sqlite3'
import { defineConfig } from 'kysely-ctl'

await setTimeout(0)

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: {
		database: database(resolve(__dirname, '../example.db')),
	},
})
