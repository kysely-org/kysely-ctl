import { resolve } from "pathe";
import { isDeno, process } from "std-env";

export interface HasCWD {
  cwd?: string;
}

const ACTUAL_CWD = process.cwd?.() || (isDeno ? globalThis.Deno.cwd() : "");

let cwd: string | undefined;

export function getCWD(args?: HasCWD): string {
  return (cwd ||= args?.cwd ? resolve(ACTUAL_CWD, args.cwd) : ACTUAL_CWD);
}
