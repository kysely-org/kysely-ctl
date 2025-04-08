import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.createTable('moshe').addColumn('id', 'integer').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('moshe').execute()
}
