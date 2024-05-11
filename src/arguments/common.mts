import type { ArgsDef } from "citty";
import { DebugArg } from "./debug.mjs";
import { NoOutdatedCheckArg } from "./no-outdated-notice.mjs";
import { CWDArg } from "./cwd.mjs";
import { EnvironmentArg } from "./environment.mjs";

export const CommonArgs = {
  ...CWDArg,
  ...DebugArg,
  ...EnvironmentArg,
  ...NoOutdatedCheckArg,
} satisfies ArgsDef;
