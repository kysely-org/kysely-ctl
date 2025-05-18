import { CompiledQuery, type QueryResult } from 'kysely'
import type { ResolvedKyselyCTLConfigWithKyselyInstance } from '../config/kysely-ctl-config.mjs'

export interface Query {
	parameters?: unknown[]
	sql: string
}

export async function executeQuery(
	query: Query,
	config: ResolvedKyselyCTLConfigWithKyselyInstance,
): Promise<QueryResult<unknown>> {
	return await config.kysely.executeQuery(
		CompiledQuery.raw(query.sql, query.parameters),
	)
}
