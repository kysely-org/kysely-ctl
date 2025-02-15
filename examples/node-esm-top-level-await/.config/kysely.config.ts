import { setTimeout } from 'node:timers/promises'
import database from 'better-sqlite3'
import { defineConfig } from 'kysely-ctl'

await setTimeout(0)

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: {
		database: database('./example.db'),
	},
})
