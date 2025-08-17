import { defineArgs } from '../utils/define-args.mjs'

export const createMigrationNameArg = (required = false) =>
	defineArgs(
		{
			migration_name: {
				description: 'Migration name to run/undo.',
				required,
				type: 'positional',
			},
		},
		true,
	)
