import type { Migration, MigrationProvider } from 'kysely'
import { join } from 'pathe'
import { filename } from 'pathe/utils'
import { consola } from 'consola'
import { safeReaddir } from '../utils/safe-readdir.mjs'
import { isTSFile } from '../utils/is-ts-file.mjs'
import { importTSFile } from '../utils/import-ts-file.mjs'

/**
 * An opinionated migration provider that reads migrations from TypeScript files.
 * Same as `FileMigrationProvider` but works in ESM/CJS without loader flag/s,
 * and on Windows too.
 */
export class TSFileMigrationProvider implements MigrationProvider {
	readonly #props: TSFileMigrationProviderProps

	constructor(props: TSFileMigrationProviderProps) {
		this.#props = props
	}

	async getMigrations(): Promise<Record<string, Migration>> {
		const migrations: Record<string, Migration> = {}

		const files = await safeReaddir(this.#props.migrationFolder)

		for (const fileName of files) {
			if (!isTSFile(fileName)) {
				consola.warn(`Ignoring \`${fileName}\` - not a TS file.`)
				continue
			}

			const filePath = join(this.#props.migrationFolder, fileName)

			const migration = await importTSFile(filePath)

			const migrationKey = filename(fileName)

			if (isMigration(migration?.default)) {
				migrations[migrationKey] = migration.default
			} else if (isMigration(migration)) {
				migrations[migrationKey] = migration
			} else {
				consola.warn(`Ignoring \`${fileName}\` - not a migration.`)
			}
		}

		return migrations
	}
}

function isMigration(obj: unknown): obj is Migration {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		!Array.isArray(obj) &&
		'up' in obj &&
		typeof obj.up === 'function'
	)
}

export interface TSFileMigrationProviderProps {
	migrationFolder: string
}
