import { defineConfig } from 'kysely-ctl'
import database from 'better-sqlite3'

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: {
		database: database('./example.db'),
	},
})
