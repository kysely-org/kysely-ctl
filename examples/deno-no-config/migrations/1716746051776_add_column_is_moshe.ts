import type { Kysely } from 'npm:kysely@^0.28.5'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('moshe').addColumn('is_moshe', 'boolean').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('moshe').dropColumn('is_moshe').execute()
}
