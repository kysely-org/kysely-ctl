import { consola } from 'consola'
import type { Migration, MigrationProvider } from 'kysely'
import { join } from 'pathe'
import { filename } from 'pathe/utils'
import { getFileType } from '../utils/get-file-type.mjs'
import { importTSFile } from '../utils/import-ts-file.mjs'
import { isObject } from '../utils/is-object.mjs'
import type { GetJitiArgs } from '../utils/jiti.mjs'
import { safeReaddir } from '../utils/safe-readdir.mjs'
import { parseSQLMigration } from './parse-sql-migration.mjs'

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
		const files = await safeReaddir(this.#props.migrationFolder)

		const migrations: Record<string, Migration> = {}

		for (const fileName of files) {
			const fileType = getFileType(fileName)

			if (fileType === 'IRRELEVANT') {
				consola.warn(`Ignoring \`${fileName}\`.`)
				continue
			}

			if (fileType === 'JS' && !this.#props.allowJS) {
				consola.warn(`Ignoring \`${fileName}\` - JS files are not allowed.`)
				continue
			}

			if (fileType === 'SQL' && !this.#props.allowSQL) {
				consola.warn(`Ignoring \`${fileName}\` - SQL files are not allowed.`)
				continue
			}

			const filePath = join(this.#props.migrationFolder, fileName)

			const migrationModule = await {
				JS: () => import(filePath),
				SQL: () => parseSQLMigration(filePath),
				TS: () => importTSFile(filePath, this.#props),
			}[fileType]()

			const migrationKey = filename(fileName)

			if (!migrationKey) {
				continue
			}

			const migration = isMigration(migrationModule?.default)
				? migrationModule.default
				: isMigration(migrationModule)
					? migrationModule
					: null

			if (!migration) {
				consola.warn(`Ignoring \`${fileName}\` - not a migration.`)
				continue
			}

			migrations[migrationKey] = migration
		}

		return migrations
	}
}

function isMigration(thing: unknown): thing is Migration {
	return isObject(thing) && typeof thing.up === 'function'
}

export interface TSFileMigrationProviderProps extends GetJitiArgs {
	allowJS?: boolean
	allowSQL?: boolean
	migrationFolder: string
}
