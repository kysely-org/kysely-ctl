import type { CommandDef } from 'citty'
import { CommonArgs } from '../../arguments/common.mjs'
import { createSubcommand } from '../../utils/create-subcommand.mjs'
import { defineCommand } from '../../utils/define-command.mjs'
import { DownCommand } from './down.mjs'
import { LatestCommand } from './latest.mjs'
import { ListCommand } from './list.mjs'
import { MakeCommand } from './make.mjs'
import { RollbackCommand } from './rollback.mjs'
import { UpCommand } from './up.mjs'

const subCommands = {
	...DownCommand,
	...LatestCommand,
	...ListCommand,
	...MakeCommand,
	...RollbackCommand,
	...UpCommand,
} satisfies CommandDef['subCommands']

const Command = defineCommand(CommonArgs, {
	subCommands,
})

export const MigrateCommand = createSubcommand('migrate', Command)
