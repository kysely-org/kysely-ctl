import type { DetectResult } from 'package-manager-detector'
import { detect } from 'package-manager-detector/detect'
import { isBun, isDeno } from 'std-env'
import { getCWD } from '../config/get-cwd.mjs'

export async function getPackageManager(): Promise<DetectResult> {
	const packageManager = await detect({
		cwd: getCWD(),
		strategies: ['packageManager-field', 'devEngines-field', 'lockfile'],
	})

	if (!packageManager) {
		const name = isDeno ? 'deno' : isBun ? 'bun' : 'npm'

		return { name, agent: name }
	}

	return packageManager
}
