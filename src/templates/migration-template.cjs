/**
 * @param {import('kysely').Kysely<unknown>}
 * @returns {Promise<void>}
 */
exports.up = async (db) => {
	// up migration code goes here...
	// note: up migrations are mandatory. you must implement this function.
	// For more info, see: https://kysely.dev/docs/migrations
}

/**
 * @param {import('kysely').Kysely<unknown>}
 * @returns {Promise<void>}
 */
exports.down = async (db) => {
	// down migration code goes here...
	// note: down migrations are optional. you can safely delete this function.
	// For more info, see: https://kysely.dev/docs/migrations
}
