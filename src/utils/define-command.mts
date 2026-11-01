import process from 'node:process'
import {
	type CommandContext,
	type CommandDef,
	type ParsedArgs,
	showUsage,
} from 'citty'
import { consola } from 'consola'
import type { StrictArgsDef } from './define-args.mjs'
import { hydrate } from './hydrate.mjs'
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

			const ctx = mergedContext || context

			consola.debug('context', ctx)

			const { args } = ctx

			if (args.version) {
				return await printInstalledVersions()
			}

			if (args.help || !command.run) {
				return await showUsage(context.cmd, parentCommand)
			}

			return await command.run(ctx)
		},
		setup: async (context) => {
			if (context.args.help) {
				await showHelp(context.cmd, context.args._)
				process.exit(0)
			}

			parentCommand = lastSetupCommand
			lastSetupCommand = context.cmd

			mergedContext = mergeContexts(context, mergedContext)

			return command.setup?.(mergedContext)
		},
		subCommands,
	}

	return definedCommand
}

async function showHelp(command: CommandDef, names: string[]): Promise<void> {
	let current = command
	let parent: CommandDef | undefined

	for (const name of names) {
		const subCommands = await hydrate(current.subCommands, [])
		const subCommand = await hydrate(subCommands?.[name], [])
		if (!subCommand) {
			break
		}

		parent = current
		current = subCommand
	}

	await showUsage(current, parent)
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
