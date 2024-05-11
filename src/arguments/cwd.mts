import type { ArgsDef } from "citty";

export const CWDArg = {
  cwd: {
    description: "The current working directory to use for relative paths.",
    type: "string",
  },
} satisfies ArgsDef;
