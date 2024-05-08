import { ArgDef } from "citty";

export const EnvironmentArg = {
  environment: {
    alias: "e",
    description: "The environment to use",
    type: "string",
    valueHint: "prod | dev | test | ...",
  } satisfies ArgDef,
};
