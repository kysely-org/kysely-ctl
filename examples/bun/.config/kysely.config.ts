// @ts-expect-error no idea why it can't find the module despite @types/bun being installed
import { Database } from 'bun:sqlite'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import { defineConfig } from 'kysely-ctl'

if (Bun.env) {
	// biome-ignore lint/suspicious/noConsole: console.log is fine here
	console.log('Bun env is available')
}

export default defineConfig({
	dialect: new BunSqliteDialect({
		database: new Database('./example.db'),
	}),
})
