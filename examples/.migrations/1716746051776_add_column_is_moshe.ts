import type { Kysely } from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: this is fine.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('moshe').addColumn('is_moshe', 'boolean').execute()
}

// biome-ignore lint/suspicious/noExplicitAny: this is fine.
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('moshe').dropColumn('is_moshe').execute()
}
