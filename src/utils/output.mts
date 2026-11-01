import { parseArgs } from 'citty'
import { process } from 'std-env'

export function isJSONOutput(rawArgs: string[]): boolean {
	const args = parseArgs(rawArgs, {
		json: { type: 'boolean' },
		format: { alias: 'f', type: 'string' },
	})
	return args.json === true || args.format === 'json'
}

export function printJSON(value: unknown): void {
	process.stdout?.write(`${JSON.stringify(value, null, 2)}\n`)
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

	let result: unknown

	try {
		result = await callback()
	} catch (error) {
		process.exitCode = 1
		result = { status: 'error', error: serializeError(error) }
	}

	printJSON(result)
}
