import { buildCLI } from "./cli.mjs";

export async function main(argv: string[]): Promise<void> {
  const cli = await buildCLI();

  await cli.parse({
    rawArgs: argv,
  });
}
