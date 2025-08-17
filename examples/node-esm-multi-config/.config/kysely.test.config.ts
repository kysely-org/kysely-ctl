import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import database from 'better-sqlite3'
import { defineConfig } from 'kysely-ctl'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	extends: './kysely.config.ts',
	dialectConfig: () => {
		// biome-ignore lint/suspicious/noConsole: it's fine.
		console.log('test config loaded!')

		return {
			database: database(resolve(__dirname, '../test.db')),
		}
	},
})
