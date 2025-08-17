import { defineArgs } from '../utils/define-args.mjs'

export const DebugArg = defineArgs(
	{
		debug: {
			default: false,
			description: 'Show debug information.',
			type: 'boolean',
		},
	},
	true,
)
