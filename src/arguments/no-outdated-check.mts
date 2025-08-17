import { defineArgs } from '../utils/define-args.mjs'

export const NoOutdatedCheckArg = defineArgs(
	{
		'no-outdated-check': {
			description:
				'Will not check for latest kysely/kysely-ctl versions and notice newer versions exist.',
			type: 'boolean',
		},
	},
	true,
)
