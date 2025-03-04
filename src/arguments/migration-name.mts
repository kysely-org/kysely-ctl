import type { ArgsDef } from 'citty'

export const createMigrationNameArg = (required = false) =>
	({
		migration_name: {
			description: 'Migration name to create.',
			required,
			type: 'positional',
		},
	}) satisfies ArgsDef
