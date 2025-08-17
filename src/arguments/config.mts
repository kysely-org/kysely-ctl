import { defineArgs } from '../utils/define-args.mjs'

export const ConfigArg = defineArgs(
	{
		config: {
			alias: 'c',
			description: 'Path to the config file.',
			type: 'string',
		},
	},
	true,
)
