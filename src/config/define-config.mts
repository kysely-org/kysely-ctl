import type { C12InputConfig } from 'c12'
import type { PartialDeep } from 'type-fest'
import type { KyselyCTLConfig } from './kysely-ctl-config.mjs'

export const defineConfig = (
	input: KyselyCTLConfig & C12InputConfig<PartialDeep<KyselyCTLConfig>>,
): KyselyCTLConfig & C12InputConfig<PartialDeep<KyselyCTLConfig>> => input
