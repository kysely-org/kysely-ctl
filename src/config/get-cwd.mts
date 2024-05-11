import { resolve } from "pathe";
import { process } from "std-env";

export interface HasCWD {
  cwd?: string;
}

const ACTUAL_CWD = process.cwd!();

export function getCWD(args?: HasCWD): string {
  if (args?.cwd) {
    return resolve(ACTUAL_CWD, args.cwd);
  }

  return ACTUAL_CWD;
}
