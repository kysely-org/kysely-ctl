import type { C12InputConfig } from 'c12'
import type { PartialDeep } from 'type-fest'
import type { KyselyCTLConfig } from './kysely-ctl-config.mjs'

type PartialKyselyCTLConfig = PartialDeep<KyselyCTLConfig>

export type DefineConfigInput = (
	| (PartialKyselyCTLConfig & { extends: string | string[] })
	| (KyselyCTLConfig & { extends?: never })
) &
	C12InputConfig<PartialKyselyCTLConfig>

export const defineConfig = (input: DefineConfigInput): DefineConfigInput =>
	input
