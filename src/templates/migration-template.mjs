/**
 * @param {import('kysely').Kysely<any>} db `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
 * @returns {Promise<void>}
 */
export async function up(db) {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
}

/**
 * @param {import('kysely').Kysely<any>} db `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
 * @returns {Promise<void>}
 */
export async function down(db) {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
}
