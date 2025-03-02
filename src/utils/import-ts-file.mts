import { runtime } from 'std-env'
import { type GetJitiArgs, getJiti } from './jiti.mjs'

export async function importTSFile(
	path: string,
	args: GetJitiArgs,
): Promise<unknown> {
	// a runtime that supports importing TypeScript files
	if (runtime !== 'node') {
		return await import(path)
	}

	const jiti = await getJiti(args)

	return await jiti.import(path)
}
