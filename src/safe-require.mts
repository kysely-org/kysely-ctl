/**
 * Tries to require a package, returns true if successful.
 *
 * Inspired by acro5piano (Kay Gosho)'s  kysely-migration-cli
 * https://github.com/acro5piano/kysely-migration-cli/blob/main/bin/kysely-migration-cli.js
 */
export function safeRequire(
  pkg: string | readonly [string, readonly unknown[]]
): boolean {
  try {
    const [packageName, args] = Array.isArray(pkg) ? pkg : [pkg];
    const mod = require(packageName);
    if (args) {
      mod(...args);
    }
    return true;
  } catch (error) {
    return false;
  }
}
