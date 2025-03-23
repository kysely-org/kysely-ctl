import type { Kysely } from 'kysely'

if (Deno.env) {
	console.log('Deno env is available')
}

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema.createTable('moshe').addColumn('id', 'integer').execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('moshe').execute()
}
