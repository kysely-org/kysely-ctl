import { detectPackageManager, type PackageManager } from 'nypm'
import { isBun, isDeno } from 'std-env'
import { getCWD } from '../config/get-cwd.mjs'

export interface EnrichedPackageManager {
	name: PackageManager['name'] | 'deno'
	command: PackageManager['command'] | 'deno'
	inProject: boolean
}

export async function getPackageManager(): Promise<EnrichedPackageManager> {
	const packageManager = await detectPackageManager(getCWD(), {
		ignoreArgv: true,
		includeParentDirs: true,
	})

	if (packageManager) {
		return { ...packageManager, inProject: true }
	}

	const name = isDeno ? 'deno' : isBun ? 'bun' : 'npm'

	return { name, command: name, inProject: false }
}
