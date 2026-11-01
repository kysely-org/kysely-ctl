import type { Agent } from 'package-manager-detector'
import { detect } from 'package-manager-detector/detect'
import { isBun, isDeno } from 'std-env'
import { getCWD } from '../config/get-cwd.mjs'

export async function getPackageManager(): Promise<Agent> {
	const packageManager = await detect({
		cwd: getCWD(),
		strategies: ['packageManager-field', 'devEngines-field', 'lockfile'],
	})

	if (!packageManager) {
		return isDeno ? 'deno' : isBun ? 'bun' : 'npm'
	}

	return packageManager.agent
}
