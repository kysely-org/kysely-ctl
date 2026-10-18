import type { ArgsDef, CommandContext } from 'citty'

/**
 * Check if the current command is a subcommand.
 */
export function isInSubcommand<A extends ArgsDef>(
	context: CommandContext<A>,
): boolean {
	const {
		args,
		cmd: { subCommands },
	} = context

	if (!subCommands) {
		return false
	}

	const potentialSubCommand = args._[0]

	return potentialSubCommand !== undefined && potentialSubCommand in subCommands
}
