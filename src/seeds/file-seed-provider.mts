import { consola } from 'consola'
import { join } from 'pathe'
import { filename } from 'pathe/utils'
import { importTSFile } from '../utils/import-ts-file.mjs'
import { isTSFile } from '../utils/is-ts-file.mjs'
import { safeReaddir } from '../utils/safe-readdir.mjs'
import type { Seed, SeedProvider } from './seeder.mjs'

export class FileSeedProvider implements SeedProvider {
	readonly #props: FileSeedProviderProps

	constructor(props: FileSeedProviderProps) {
		this.#props = props
	}

	async getSeeds(seedNames?: string | string[]): Promise<Record<string, Seed>> {
		const seeds: Record<string, Seed> = {}

		let files = await safeReaddir(this.#props.seedFolder)

		if (seedNames) {
			const seedNameArray = Array.isArray(seedNames) ? seedNames : [seedNames]

			if (seedNameArray.length) {
				files = files.filter((fileName) =>
					seedNameArray.includes(filename(fileName)),
				)
			}
		}

		for (const fileName of files) {
			if (!isTSFile(fileName)) {
				consola.warn(`Ignoring \`${fileName}\` - not a TS file.`)
				continue
			}

			const filePath = join(this.#props.seedFolder, fileName)

			const seed = await importTSFile(filePath)

			const seedKey = filename(fileName)

			if (isSeed(seed?.default)) {
				seeds[seedKey] = seed.default
			} else if (isSeed(seed)) {
				seeds[seedKey] = seed
			} else {
				consola.warn(`Ignoring \`${fileName}\` - not a seed.`)
			}
		}

		return seeds
	}
}

function isSeed(obj: unknown): obj is Seed {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		!Array.isArray(obj) &&
		'seed' in obj &&
		typeof obj.seed === 'function'
	)
}

export interface FileSeedProviderProps {
	seedFolder: string
}
