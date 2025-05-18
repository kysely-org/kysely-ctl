import database from 'better-sqlite3'
import { DUMMY_DIALECT_CONFIG, defineConfig } from 'kysely-ctl'

export default defineConfig({
	dialect: 'better-sqlite3',
	dialectConfig: DUMMY_DIALECT_CONFIG,
	$env: {
		lib1: {
			dialectConfig: () => ({
				database: database('./packages/lib1/example.db'),
			}),
			migrations: {
				migrationFolder: './packages/lib1/migrations',
			},
		},
		lib2: {
			dialectConfig: () => ({
				database: database('./packages/lib2/example.db'),
			}),
			migrations: {
				migrationFolder: './packages/lib2/migrations',
			},
		},
	},
})
