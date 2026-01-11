import {
	type CommandContext,
	type CommandDef,
	type ParsedArgs,
	showUsage,
} from 'citty'
import { consola } from 'consola'
import type { StrictArgsDef } from './define-args.mjs'
import { isInSubcommand } from './is-in-subcommand.mjs'
import { printInstalledVersions } from './version.mjs'

// biome-ignore lint/suspicious/noExplicitAny: it's fine
let lastSetupCommand: CommandDef<any> | undefined
// biome-ignore lint/suspicious/noExplicitAny: it's fine
let mergedContext: CommandContext<any> | undefined

export function defineCommand<
	Args extends StrictArgsDef,
	const Command extends Omit<CommandDef<Args>, 'args'> & {
		args?: never
	},
>(argDefs: Args, command: Command): CommandDef<Args> {
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
	let parentCommand: CommandDef<any> | undefined

	const subCommands = sortSubCommands(command.subCommands)
	const subCommandUnion = Object.keys(subCommands || {}).join('|')

	const definedCommand: CommandDef<Args> = {
		...command,
		args: argDefs,
		meta: {
			description: subCommandUnion ? `\`${subCommandUnion}\`` : undefined,
			...command.meta,
		},
		run: async (context) => {
			if (isInSubcommand(context)) {
				return
			}

			if (mergedContext) {
				context = mergedContext
			}

			consola.debug('context', context)

			const { args } = context

			if (args.version) {
				return await printInstalledVersions()
			}

			if (!command.run) {
				return await showUsage(definedCommand, parentCommand)
			}

			return await command.run(context)
		},
		setup: (context) => {
			parentCommand = lastSetupCommand
			lastSetupCommand = definedCommand

			mergedContext = mergeContexts(context, mergedContext)

			return command.setup?.(mergedContext)
		},
		subCommands,
	}

	return definedCommand
}

function sortSubCommands(
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
	subCommands: CommandDef<any>['subCommands'],
	// biome-ignore lint/suspicious/noExplicitAny: it's fine
): CommandDef<any>['subCommands'] {
	if (!subCommands) {
		return
	}

	return Object.fromEntries(
		Object.entries(subCommands).sort(([nameA], [nameB]) =>
			nameA.localeCompare(nameB),
		),
	)
}

function mergeContexts(
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	currentContext: CommandContext<any>,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	previousContext: CommandContext<any> | undefined,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
): CommandContext<any> {
	return {
		...currentContext,
		args: mergeArgs(currentContext.args, previousContext?.args),
		rawArgs: previousContext?.rawArgs || currentContext.rawArgs,
	}
}

function mergeArgs(
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	currentArgs: ParsedArgs<any>,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	previousArgs: ParsedArgs<any> | undefined,
	// biome-ignore lint/suspicious/noExplicitAny: it's fine.
): ParsedArgs<any> {
	return Object.entries(currentArgs).reduce(
		(args, [key, value]) => {
			if (typeof value === 'boolean') {
				args[key] ||= value
			} else if (Array.isArray(value)) {
				args[key] = [...(Array.isArray(args[key]) ? args[key] : []), ...value]
			} else {
				args[key] = value
			}

			return args
		},
		{ ...previousArgs } as Record<string, unknown>,
		// biome-ignore lint/suspicious/noExplicitAny: it's fine.
	) as ParsedArgs<any>
}
