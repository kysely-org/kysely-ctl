import type { ArgsDef } from 'citty'

const ExperimentalResolveTSConfigPathsArg = {
	'experimental-resolve-tsconfig-paths': {
		default: false,
		description:
			'Attempts to resolve path aliases using the tsconfig.json file.',
		type: 'boolean',
	},
} satisfies ArgsDef

const NoFilesystemCachingArg = {
	'no-filesystem-caching': {
		default: false,
		description:
			'Will not write cache files to disk. See https://github.com/unjs/jiti#fscache for more information.',
		type: 'boolean',
	},
} satisfies ArgsDef

export const JitiArgs = {
	...ExperimentalResolveTSConfigPathsArg,
	...NoFilesystemCachingArg,
} satisfies ArgsDef
