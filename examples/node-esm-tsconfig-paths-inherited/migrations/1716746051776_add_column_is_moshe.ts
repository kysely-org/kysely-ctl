import { MOSHE_TABLE } from '@config/db'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable(MOSHE_TABLE)
		.addColumn('is_moshe', 'boolean')
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable(MOSHE_TABLE).dropColumn('is_moshe').execute()
}
