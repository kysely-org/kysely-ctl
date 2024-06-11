import type { ArgsDef } from 'citty'

export const createMigrationNameArg = (required = false) =>
	({
		migration_name: {
			description: 'Migration name to run/undo',
			required,
			type: 'positional',
		},
	}) satisfies ArgsDef
