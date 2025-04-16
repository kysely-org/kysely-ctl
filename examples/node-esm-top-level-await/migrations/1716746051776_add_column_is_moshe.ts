import { setTimeout } from 'node:timers/promises'
import type { Kysely } from 'kysely'

await setTimeout(0)

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('moshe').addColumn('is_moshe', 'boolean').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.alterTable('moshe').dropColumn('is_moshe').execute()
}
