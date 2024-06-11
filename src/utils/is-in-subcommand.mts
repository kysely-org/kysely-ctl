import type { ArgsDef, CommandContext } from 'citty'

/**
 * Check if the current command is a subcommand.
 */
export function isInSubcommand<A extends ArgsDef>(
	context: CommandContext<A>,
): boolean {
	const {
		cmd: { subCommands },
		rawArgs,
	} = context

	if (!subCommands) {
		return false
	}

	const potentialSubCommand = rawArgs.find((arg) => !arg.startsWith('-'))

	return potentialSubCommand !== undefined && potentialSubCommand in subCommands
}
