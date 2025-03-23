import type { Kysely } from 'kysely'

if (Bun.env) {
	// biome-ignore lint/suspicious/noConsole: console.log is fine here
	console.log('Bun env is available')
}

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('moshe').addColumn('id', 'integer').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('moshe').execute()
}
