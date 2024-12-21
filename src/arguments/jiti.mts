import type { ArgsDef } from 'citty'

const NoFilesystemCachingArg = {
	'no-filesystem-caching': {
		default: false,
		description:
			'Will not write cache files to disk. See https://github.com/unjs/jiti#fscache for more information.',
		type: 'boolean',
	},
} satisfies ArgsDef

export const JitiArgs = {
	...NoFilesystemCachingArg,
} satisfies ArgsDef
