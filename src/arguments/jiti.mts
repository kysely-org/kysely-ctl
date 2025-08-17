import { defineArgs } from '../utils/define-args.mjs'

export const JitiArgs = defineArgs(
	{
		'experimental-resolve-tsconfig-paths': {
			default: false,
			description:
				'Attempts to resolve path aliases using your `tsconfig.json` file/s.',
			type: 'boolean',
		},
		'no-filesystem-caching': {
			description:
				'Will not write cache files to disk. See https://github.com/unjs/jiti#fscache for more information.',
			type: 'boolean',
		},
	},
	true,
)
