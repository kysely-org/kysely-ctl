import type { CommandDef } from 'citty'
import { CommonArgs } from '../../arguments/common.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { ListCommand } from './list.mjs'
import { MakeCommand } from './make.mjs'
import { RunCommand } from './run.mjs'

const subCommands = {
	...ListCommand,
	...MakeCommand,
	...RunCommand,
} satisfies CommandDef['subCommands']

const Command = defineCommand(CommonArgs, {
	subCommands,
})

export const SeedCommand = createSubcommand('seed', Command)
