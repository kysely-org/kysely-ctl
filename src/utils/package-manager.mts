import { detect } from 'package-manager-detector/detect'
import { isBun, isDeno } from 'std-env'
import { getCWD } from '../config/get-cwd.mjs'

const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun', 'deno'] as const

export type PackageManagerName = (typeof PACKAGE_MANAGERS)[number]

export interface EnrichedPackageManager {
	name: PackageManagerName
	inProject: boolean
}

export async function getPackageManager(): Promise<EnrichedPackageManager> {
	const packageManager = await detect({
		cwd: getCWD(),
		strategies: ['packageManager-field', 'devEngines-field', 'lockfile'],
	})
	const detectedName = PACKAGE_MANAGERS.find(
		(name) => name === packageManager?.name,
	)

	if (!detectedName) {
		return { name: isDeno ? 'deno' : isBun ? 'bun' : 'npm', inProject: false }
	}

	return { name: detectedName, inProject: true }
}
