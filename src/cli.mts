import { type RunMainOptions, createMain, defineCommand } from "citty";
import { RootCommand } from "./commands/root.mjs";

export interface CLI {
  parse(options?: RunMainOptions): Promise<void>;
}

export async function buildCLI(): Promise<CLI> {
  const main = defineCommand(RootCommand);

  return {
    parse: createMain(main),
  };
}
