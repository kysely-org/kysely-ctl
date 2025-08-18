import type { Kysely } from 'kysely'

const CAPTURE_COMMON_CLASS_SUFFIXES = /adapter|dialect/gi

export function inferDialectName(kysely: Kysely<unknown>): string {
	return kysely
		.getExecutor()
		.adapter.constructor.name.replaceAll(CAPTURE_COMMON_CLASS_SUFFIXES, '')
		.toLowerCase()
}
