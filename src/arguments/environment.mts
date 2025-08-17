import { defineArgs } from '../utils/define-args.mjs'

export const EnvironmentArg = defineArgs(
	{
		environment: {
			alias: 'e',
			description:
				'Apply environment-specific overrides to the configuration. See https://github.com/unjs/c12#environment-specific-configuration for more information.',
			type: 'string',
			valueHint: 'production | development | test | ...',
		},
	},
	true,
)
