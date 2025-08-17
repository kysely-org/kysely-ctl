import type { CommandContext, CommandDef, CommandMeta, Resolvable } from 'citty'
import type { StrictArgsDef } from './define-args.mjs'

export type StrictCommandDef<Args extends StrictArgsDef> = Omit<
	CommandDef<Args>,
	'cleanup' | 'meta' | 'run' | 'setup'
> & {
	args: Resolvable<Args>
	cleanup?(context: CommandContext<Args>): void | Promise<void>
	meta: Resolvable<
		Omit<CommandMeta, 'description'> & {
			description: NonNullable<CommandMeta['description']>
		}
	>
	run(context: CommandContext<Args>): void | Promise<void>
	setup?(context: CommandContext<Args>): void | Promise<void>
}

export function defineCommand<
	Args extends StrictArgsDef,
	const Command extends Omit<StrictCommandDef<Args>, 'args'> & { args?: never },
>(args: Args, command: Command): Command & { args: Args } {
	return {
		...command,
		args,
		subCommands: sortSubCommands(command.subCommands),
	}
}

function sortSubCommands(
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
	subCommands: StrictCommandDef<any>['subCommands'],
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
): StrictCommandDef<any>['subCommands'] {
	if (!subCommands) {
		return
	}

	return Object.fromEntries(
		Object.entries(subCommands).sort(([nameA], [nameB]) =>
			nameA.localeCompare(nameB),
		),
	)
}
