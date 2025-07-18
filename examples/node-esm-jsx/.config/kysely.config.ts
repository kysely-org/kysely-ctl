import database from 'better-sqlite3'
import { defineConfig } from 'kysely-ctl'
import { DB_PATH } from '../src'

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: {
		database: database(DB_PATH),
	},
})
