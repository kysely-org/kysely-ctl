/**
 * Tries to require a package, returns true if successful.
 *
 * Inspired by acro5piano (Kay Gosho)'s  kysely-migration-cli
 * https://github.com/acro5piano/kysely-migration-cli/blob/main/bin/kysely-migration-cli.js
 */
export async function safeRequire<T>(pkg: Requireable): Promise<T | null> {
  const [packageName, rootArgs, subCommand, subCommandArgs] = Array.isArray(pkg)
    ? pkg
    : [pkg];
  let err;

  try {
    const mod = await import(packageName);

    if (!rootArgs) {
      return mod;
    }

    const output0 = mod.default(...rootArgs);

    if (!subCommand) {
      return output0;
    }

    return output0[subCommand](...subCommandArgs);
  } catch (error) {
    err = error;
    return null;
  } finally {
    if (!err) {
      console.log(`Loaded ${packageName}`);
    }
  }
}

export type Requireable =
  | string
  | readonly [string, readonly unknown[]]
  | readonly [string, readonly unknown[], string, readonly unknown[]];
