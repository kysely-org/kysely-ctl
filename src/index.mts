import { installTSTranspiler } from "./ts-transpilers.mjs";

export function main() {
  console.log("Hello, world!");

  installTSTranspiler();

  console.log("Bye!");
}
