import {
  type RunMainOptions,
  createMain,
  defineCommand,
  showUsage,
} from "citty";
import { getCLIVersion, getKyselyVersion } from "./version.mjs";

export interface CLI {
  parse(options?: RunMainOptions): Promise<void>;
}

export async function buildCLI(): Promise<CLI> {
  const main = defineCommand({
    meta: {
      name: "kysely",
      description: "A command-line tool for Kysely",
    },
    args: {
      debug: {
        default: false,
        description: "Show debug information",
        type: "boolean",
      },
      version: {
        alias: "v",
        default: false,
        description: "Show version number",
        type: "boolean",
      },
    },
    async run({ args, cmd }) {
      if (args.version) {
        const kyselyVersion = await getKyselyVersion();

        console.log(
          `kysely ${kyselyVersion ? `v${kyselyVersion}` : "[not installed]"}`
        );

        const cliVersion = await getCLIVersion();
        console.log(`kysely-ctl v${cliVersion}`);
      } else {
        await showUsage(cmd);
      }
    },
  });

  return {
    parse: createMain(main),
  };
}
