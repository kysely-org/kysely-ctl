import type { Kysely } from 'kysely'

const CAPTURE_COMMON_CLASS_SUFFIXES = /adapter|dialect/i

export function inferDialectName(kysely: Kysely<unknown>): string {
	return kysely
		.getExecutor()
		.adapter.constructor.name.replace(CAPTURE_COMMON_CLASS_SUFFIXES, '')
		.toLowerCase()
}
