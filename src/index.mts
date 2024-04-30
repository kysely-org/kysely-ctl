import { installTSTranspiler } from "./ts-transpilers.mjs";

export async function main(argv: string[]): Promise<void> {
  await installTSTranspiler();
}
