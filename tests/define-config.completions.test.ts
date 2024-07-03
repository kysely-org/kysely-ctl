import { attest } from '@arktype/attest'
import { describe, it } from 'vitest'
import type {
	DefineConfigInput,
	ResolvableKyselyDialect,
} from '../dist/index.js'

describe('defineConfig', () => {
	it('should provide completions for dialect name', () => {
		// @ts-expect-error
		attest(() => ({ dialect: '' }) as DefineConfigInput).completions({
			'': [
				'better-sqlite3',
				'mysql2',
				'pg',
				'postgres',
				'tedious',
			] satisfies ResolvableKyselyDialect[],
		})
	})
})
