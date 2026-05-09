import { defineArgs } from '../utils/define-args.mjs'

export const JitiArgs = defineArgs(
	{
		'no-filesystem-caching': {
			default: false,
			description:
				'Will not write cache files to disk. See https://github.com/unjs/jiti#fscache for more information.',
			type: 'boolean',
		},
	},
	true,
)
