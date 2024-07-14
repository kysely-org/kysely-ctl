import { consola } from 'consola'
import { process } from 'std-env'

export function handleAggregateError(error: unknown): void {
	if (error instanceof AggregateError) {
		for (const subError of error.errors) {
			consola.error(subError)
		}
	}
}

export function exitWithError(error: unknown): never {
	process.exit?.(1)
	throw error
}
