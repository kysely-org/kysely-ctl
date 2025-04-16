import type { Kysely } from 'kysely'
import { assertDefined } from '../utils/assert-defined.mjs'

export class Seeder {
	readonly #props: SeederProps

	constructor(props: SeederProps) {
		this.#props = props
	}

	async getSeeds(seedNames?: string | string[]): Promise<SeedInfo[]> {
		const seeds = await this.#props.provider.getSeeds(seedNames)

		return Object.entries(seeds).map(([name, seed]) => ({
			name,
			seed,
		}))
	}

	async run(seedNames?: string | string[]): Promise<SeedResultSet> {
		const seeds = await this.getSeeds(seedNames)

		const resultSet = {
			error: undefined as unknown,
			results: seeds.map(
				(seed) =>
					({
						seedName: seed.name,
						status: 'NotExecuted' as SeedResult['status'],
					}) satisfies SeedResult,
			),
		}

		for (let i = 0, len = seeds.length; i < len && !resultSet.error; ++i) {
			const result = resultSet.results[i]
			assertDefined(result)

			const seedInfo = seeds[i]
			assertDefined(seedInfo)

			try {
				await seedInfo.seed.seed(this.#props.db)
				result.status = 'Success'
			} catch (err) {
				result.status = 'Error'
				resultSet.error = err
			}
		}

		return resultSet
	}
}

export interface Seed {
	seed(db: Kysely<unknown>): Promise<void>
}

export interface SeedProvider {
	getSeeds(seedNames?: string | string[]): Promise<Record<string, Seed>>
}

export interface SeederProps {
	db: Kysely<unknown>
	provider: SeedProvider
}

export interface SeedInfo {
	name: string
	seed: Seed
}

export interface SeedResultSet {
	readonly error?: unknown
	readonly results: SeedResult[]
}

export interface SeedResult {
	readonly seedName: string
	readonly status: 'Success' | 'Error' | 'NotExecuted'
}
