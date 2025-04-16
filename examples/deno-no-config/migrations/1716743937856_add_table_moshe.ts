import type { Kysely } from 'npm:kysely@^0.28.0'

if (Deno.env) {
	// biome-ignore lint/suspicious/noConsole: console.log is fine here
	console.log('Deno env is available')
}

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.createTable('moshe').addColumn('id', 'integer').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('moshe').execute()
}
