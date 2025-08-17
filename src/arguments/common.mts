import { defineArgs } from '../utils/define-args.mjs'
import { CWDArg } from './cwd.mjs'
import { DebugArg } from './debug.mjs'
import { EnvironmentArg } from './environment.mjs'
import { JitiArgs } from './jiti.mjs'
import { NoOutdatedCheckArg } from './no-outdated-check.mjs'

export const CommonArgs = defineArgs({
	...CWDArg,
	...DebugArg,
	...EnvironmentArg,
	...JitiArgs,
	...NoOutdatedCheckArg,
})
