import type { ArgsDef } from 'citty'

export const ConfigArg = {
	config: {
		description: 'The path to the configuration file to use.',
		type: 'string',
		valueHint: 'path/to/kysely.config.ts',
	},
} satisfies ArgsDef
