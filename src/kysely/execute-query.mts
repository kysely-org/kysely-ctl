import { randomUUID } from 'node:crypto'
import { CompiledQuery, type Kysely, type QueryResult } from 'kysely'

export async function executeQuery(
	sql: string,
	props: {
		kysely: Kysely<unknown>
		parameters?: unknown[]
	},
): Promise<QueryResult<unknown>> {
	return await props.kysely.executeQuery(
		CompiledQuery.raw(sql, props.parameters),
	)
}

export function streamQuery(
	sql: string,
	props: {
		chunkSize?: number
		kysely: Kysely<unknown>
		parameters?: unknown[]
	},
): AsyncIterableIterator<QueryResult<unknown>> {
	return props.kysely
		.getExecutor()
		.stream(CompiledQuery.raw(sql, props.parameters), props.chunkSize || 100, {
			queryId: randomUUID({ disableEntropyCache: true }),
		})
}
