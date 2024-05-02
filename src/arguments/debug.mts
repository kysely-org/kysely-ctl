import type { ArgDef } from "citty";

export const DebugArg = {
  default: false,
  description: "Show debug information",
  type: "boolean",
} satisfies ArgDef;
