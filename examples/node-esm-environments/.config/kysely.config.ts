import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import database from 'better-sqlite3'
import { DUMMY_DIALECT_CONFIG, defineConfig } from 'kysely-ctl'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: DUMMY_DIALECT_CONFIG,
	$env: {
		lib1: {
			dialectConfig: () => ({
				database: database(resolve(__dirname, '../packages/lib1/example.db')),
			}),
			migrations: {
				migrationFolder: '../packages/lib1/migrations',
			},
		},
		lib2: {
			dialectConfig: () => ({
				database: database(resolve(__dirname, '../packages/lib2/example.db')),
			}),
			migrations: {
				migrationFolder: '../packages/lib2/migrations',
			},
		},
	},
})
