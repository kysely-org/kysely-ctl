import type { Kysely } from 'kysely'

// replace `unknown` with your database interface.
export async function seed(db: Kysely<unknown>): Promise<void> {
	// seed code goes here...
	// note: this function is mandatory. you must implement this function.
}
