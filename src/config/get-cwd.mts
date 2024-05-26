import { resolve } from "pathe";
import { process } from "std-env";

export interface HasCWD {
  cwd?: string;
}

const ACTUAL_CWD = process.cwd!();

let cwd: string | undefined;

export function getCWD(args?: HasCWD): string {
  return (cwd ||= args?.cwd ? resolve(ACTUAL_CWD, args.cwd) : ACTUAL_CWD);
}
