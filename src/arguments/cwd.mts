import { defineArgs } from '../utils/define-args.mjs'

export const CWDArg = defineArgs(
	{
		cwd: {
			description: 'The current working directory to use for relative paths.',
			type: 'string',
		},
	},
	true,
)
