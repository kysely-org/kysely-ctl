import type { ArgsDef } from 'citty'

export const NoTransactionArg = {
	'no-transaction': {
		description:
			"Don't use a transaction when running the migrations. This will not work for now if you've provided your own Migrator factory.",
		type: 'boolean',
	},
} satisfies ArgsDef

export const MigrateArgs = {
	...NoTransactionArg,
} satisfies ArgsDef
