import { isBun, isDeno } from "std-env";
import { safeRequire } from "./safe-require.mjs";

/**
 * These are ordered by popularity.
 * https://npmtrends.com/@swc-node/register-vs-esbuild-register-vs-ts-node-vs-tsx
 */
const TRANSPILER_PACKAGES = [
  "ts-node/register/transpile-only",
  ["@babel/register", [{ extensions: [".ts"] }]],
  "esbuild-register",
  "tsx/cjs",
  "@swc-node/register",
  "esbuild-runner/register",
] as const;

/**
 * Tries to load various popular TypeScript loaders.
 * Returns true if any of them is successfully loaded.
 *
 * Inspired by acro5piano (Kay Gosho)'s  kysely-migration-cli
 * https://github.com/acro5piano/kysely-migration-cli/blob/main/bin/kysely-migration-cli.js
 */
export function installTSTranspiler(): boolean {
  if (isBun || isDeno) {
    return true;
  }

  for (const pkg of TRANSPILER_PACKAGES) {
    if (safeRequire(pkg)) {
      return true;
    }
  }

  return false;
}
