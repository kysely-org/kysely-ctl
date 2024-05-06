import { readdir } from "node:fs/promises";
import type { Migration, MigrationProvider } from "kysely";
import { join } from "pathe";
import { tsImport } from "tsx/esm/api";
import { runtime } from "std-env";

/**
 * An opinionated migration provider that reads migrations from TypeScript files.
 * Same as `FileMigrationProvider` but works in ESM/CJS without loader flag/s,
 * and on Windows too.
 */
export class TSFileMigrationProvider implements MigrationProvider {
  readonly #props: TSFileMigrationProviderProps;

  constructor(props: TSFileMigrationProviderProps) {
    this.#props = props;
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const files = await readdir(this.#props.migrationFolder);

    for (const fileName of files) {
      if (
        (fileName.endsWith(".ts") && !fileName.endsWith(".d.ts")) ||
        (fileName.endsWith(".cts") && !fileName.endsWith(".d.cts")) ||
        (fileName.endsWith(".mts") && !fileName.endsWith(".d.mts"))
      ) {
        const filePath = join(this.#props.migrationFolder, fileName);

        const migration =
          runtime === "node"
            ? await tsImport(filePath, { parentURL: import.meta.url })
            : await import(filePath);

        const migrationKey = fileName.substring(0, fileName.lastIndexOf("."));

        if (isMigration(migration?.default)) {
          migrations[migrationKey] = migration.default;
        } else if (isMigration(migration)) {
          migrations[migrationKey] = migration;
        }
      }
    }

    return migrations;
  }
}

function isMigration(obj: unknown): obj is Migration {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj) &&
    "up" in obj &&
    typeof obj.up === "function"
  );
}

export interface TSFileMigrationProviderProps {
  migrationFolder: string;
}
