import { parseArgs } from 'citty'
import { isAgent, process } from 'std-env'

export function isJSONOutput(rawArgs: string[]): boolean {
	const args = parseArgs(rawArgs, {
		json: { type: 'boolean', default: isAgent },
		format: { alias: 'f', type: 'string' },
	})
	return args.json === true || args.format === 'json'
}

export function printJSON(value: unknown): void {
	process.stdout?.write(
		`${JSON.stringify(value, (_key, item) => (typeof item === 'bigint' ? item.toString() : item), 2)}\n`,
	)
}

export function serializeError(error: unknown): {
	name: string
	message: string
	code?: string | number
} {
	if (!(error instanceof Error)) {
		return { name: 'Error', message: String(error) }
	}

	const code = 'code' in error ? error.code : undefined

	return {
		name: error.name,
		message: error.message,
		...(typeof code === 'string' || typeof code === 'number' ? { code } : {}),
	}
}
