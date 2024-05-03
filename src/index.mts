import { buildCLI } from "./cli.mjs";

export async function main(argv: string[]): Promise<void> {
  const cli = buildCLI();

  await cli.parse(argv);
}
