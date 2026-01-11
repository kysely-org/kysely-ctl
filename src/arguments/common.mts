import { defineArgs } from '../utils/define-args.mjs'
import { JitiArgs } from './jiti.mjs'

export const CommonArgs = defineArgs({
	config: {
		alias: 'c',
		description: 'Path to the config file.',
		type: 'string',
	},
	cwd: {
		description: 'The current working directory to use for relative paths.',
		type: 'string',
	},
	debug: {
		default: false,
		description: 'Show debug information.',
		type: 'boolean',
	},
	environment: {
		alias: 'e',
		description:
			'Apply environment-specific overrides to the configuration. See https://github.com/unjs/c12#environment-specific-configuration for more information.',
		type: 'string',
		valueHint: 'production | development | test | ...',
	},
	help: {
		alias: 'h',
		default: false,
		description: 'Show help information',
		type: 'boolean',
	},
	...JitiArgs,
	'no-outdated-check': {
		description:
			'Will not check for latest kysely/kysely-ctl versions and notice newer versions exist.',
		type: 'boolean',
	},
	version: {
		alias: 'v',
		default: false,
		description: 'Show version number',
		type: 'boolean',
	},
})
