import type { ArgsDef } from 'citty'
import { CWDArg } from './cwd.mjs'
import { DebugArg } from './debug.mjs'
import { EnvironmentArg } from './environment.mjs'
import { NoOutdatedCheckArg } from './no-outdated-notice.mjs'

export const CommonArgs = {
	...CWDArg,
	...DebugArg,
	...EnvironmentArg,
	...NoOutdatedCheckArg,
} satisfies ArgsDef
