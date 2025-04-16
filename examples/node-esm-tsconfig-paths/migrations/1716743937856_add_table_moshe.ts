import { MOSHE_TABLE } from '@/config/db'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.createTable(MOSHE_TABLE).addColumn('id', 'integer').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable(MOSHE_TABLE).execute()
}
