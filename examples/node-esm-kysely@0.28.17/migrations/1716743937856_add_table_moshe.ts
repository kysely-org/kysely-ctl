import { equal } from 'node:assert'
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	equal(process.env.ENABLE_LOGS, '1', 'envars not loaded as expected')

	await db.schema.createTable('moshe').addColumn('id', 'integer').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('moshe').execute()
}
