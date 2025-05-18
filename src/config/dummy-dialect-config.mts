export function DUMMY_DIALECT_CONFIG(): never {
	throw new Error(
		'`DUMMY_DIALECT_CONFIG` is a dummy dialect config that should be overriden by environment-specific configuration. You must run the command with the `-e <environment>` flag and make sure there is a configuration for `<environment>` in your `kysely.config` file.',
	)
}
