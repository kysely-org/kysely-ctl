import { consola } from 'consola'
import { process } from 'std-env'

export function exitWithError(error: unknown): never {
	if (error instanceof AggregateError) {
		for (const subError of error.errors) {
			consola.error(subError)
		}
	} else {
		consola.error(error)
	}

	process.exit?.(1)

	throw error
}
