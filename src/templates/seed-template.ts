import type { Kysely } from 'kysely'

// biome-ignore lint/suspicious/noExplicitAny: replace `any` with your database interface.
export async function seed(db: Kysely<any>): Promise<void> {
	// seed code goes here...
	// note: this function is mandatory. you must implement this function.
}
