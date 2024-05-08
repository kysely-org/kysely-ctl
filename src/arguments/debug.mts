import type { ArgDef } from "citty";

export const DebugArg = {
  debug: {
    default: false,
    description: "Show debug information",
    type: "boolean",
  } satisfies ArgDef,
};
