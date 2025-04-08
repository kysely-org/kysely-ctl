import type { Kysely } from 'npm:kysely@^0.27.6'

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('moshe').addColumn('is_moshe', 'boolean').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('moshe').dropColumn('is_moshe').execute()
}
