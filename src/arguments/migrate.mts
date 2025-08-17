import { defineArgs } from '../utils/define-args.mjs'

export const MigrateArgs = defineArgs(
	{
		'no-transaction': {
			description:
				"Don't use a transaction when running the migrations. This will not work for now if you've provided your own Migrator factory.",
			type: 'boolean',
		},
	},
	true,
)
