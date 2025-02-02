import { consola } from 'consola'
import { join } from 'pathe'
import { filename } from 'pathe/utils'
import { asArray } from '../utils/as-array.mjs'
import { getFileType } from '../utils/get-file-type.mjs'
import { importTSFile } from '../utils/import-ts-file.mjs'
import { isObject } from '../utils/is-object.mjs'
import { safeReaddir } from '../utils/safe-readdir.mjs'
import type { Seed, SeedProvider } from './seeder.mjs'

export class FileSeedProvider implements SeedProvider {
	readonly #props: FileSeedProviderProps

	constructor(props: FileSeedProviderProps) {
		this.#props = props
	}

	async getSeeds(seedNames?: string | string[]): Promise<Record<string, Seed>> {
		const seedNamesMap: Record<string, true> = {}

		if (seedNames) {
			for (const seedName of asArray(seedNames)) {
				seedNamesMap[seedName] = true
			}
		}

		const fileNames = await safeReaddir(this.#props.seedFolder)

		const seeds: Record<string, Seed> = {}

		for (const fileName of fileNames) {
			const fileType = getFileType(fileName)

			const isTS = fileType === 'TS'

			if (!isTS) {
				if (!this.#props.allowJS) {
					consola.warn(`Ignoring \`${fileName}\` - not a TS file.`)
					continue
				}

				if (fileType !== 'JS') {
					consola.warn(`Ignoring \`${fileName}\` - not a TS/JS file.`)
					continue
				}
			}

			const seedKey = filename(fileName)

			if (!seedKey || (seedNames && !seedNamesMap[seedKey])) {
				continue
			}

			const filePath = join(this.#props.seedFolder, fileName)

			const seedModule = await (isTS
				? importTSFile(filePath)
				: import(filePath))

			const seed = isSeed(seedModule?.default)
				? seedModule.default
				: isSeed(seedModule)
					? seedModule
					: null

			if (!seed) {
				consola.warn(`Ignoring \`${fileName}\` - not a seed.`)
				continue
			}

			seeds[seedKey] = seed
		}

		return seeds
	}
}

function isSeed(thing: unknown): thing is Seed {
	return isObject(thing) && typeof thing.seed === 'function'
}

export interface FileSeedProviderProps {
	allowJS?: boolean
	seedFolder: string
}
