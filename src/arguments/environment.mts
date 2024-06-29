import type { ArgsDef } from 'citty'

export const EnvironmentArg = {
	environment: {
		alias: 'e',
		description:
			'Apply environment-specific overrides to the configuration. See https://github.com/unjs/c12#environment-specific-configuration for more information.',
		type: 'string',
		valueHint: 'production | development | test | ...',
	},
} satisfies ArgsDef
