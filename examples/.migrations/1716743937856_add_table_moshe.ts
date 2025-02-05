import type { Kysely } from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: this is fine.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('moshe').addColumn('id', 'integer').execute()
}

// biome-ignore lint/suspicious/noExplicitAny: this is fine.
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('moshe').execute()
}
