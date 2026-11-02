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
} {
	return error instanceof Error
		? { name: error.name, message: error.message }
		: { name: 'Error', message: String(error) }
}

export async function runWithOutput(
	args: { json: boolean },
	callback: () => Promise<unknown>,
): Promise<void> {
	if (!args.json) {
		await callback()
		return
	}

	try {
		printJSON(await callback())
	} catch (error) {
		process.exitCode = 1
		printJSON({ status: 'error', error: serializeError(error) })
	}
}
