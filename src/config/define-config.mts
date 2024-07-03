import type { C12InputConfig } from 'c12'
import type { PartialDeep } from 'type-fest'
import type { KyselyCTLConfig } from './kysely-ctl-config.mjs'

export type DefineConfigInput = KyselyCTLConfig &
	C12InputConfig<PartialDeep<KyselyCTLConfig>>

export const defineConfig = (input: DefineConfigInput): DefineConfigInput =>
	input
