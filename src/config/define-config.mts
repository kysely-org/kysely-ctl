import type { KyselyCTLConfig, KyselyDialect } from "./kysely-ctl-config.mjs";

export function defineConfig<Dialect extends KyselyDialect>(
  config: KyselyCTLConfig<Dialect>
): KyselyCTLConfig<Dialect> {
  return config;
}
