import { consola } from "consola";
import type { MigrationResultSet, Migrator } from "kysely";
import { getMigrations } from "./get-migrations.mjs";

export async function processMigrationResultSet(
  resultSet: MigrationResultSet,
  direction: "up" | "down",
  migrator: Migrator
): Promise<void> {
  consola.debug(resultSet);

  let { error, results } = resultSet;

  if (error) {
    const failedMigration = results?.find(
      (result) => result.status === "Error"
    );

    return consola.fail(
      `Migration failed with \`${error}\`${
        failedMigration ? ` @ "${failedMigration.migrationName}"` : ""
      }`
    );
  }

  if (!results?.length) {
    return consola.info(
      `Migration skipped: no ${
        direction === "up" ? "new" : "completed"
      } migrations found`
    );
  }

  consola.success("Migration complete");

  consola.info(
    `${direction === "up" ? "Ran" : "Undone"} ${results.length} migration${
      results.length > 1 ? "s" : ""
    }:`
  );

  if (direction === "down") {
    results = [...results].reverse();
  }

  const migrations = await getMigrations(migrator);

  const untouchedMigrationsBefore = migrations.slice(
    0,
    migrations.findIndex(
      (migration) => migration.name === results[0].migrationName
    )
  );
  const untouchedMigrationsAfter = migrations.slice(
    migrations.findIndex(
      (migration) => migration.name === results.at(-1)?.migrationName
    ) + 1
  );

  untouchedMigrationsBefore.forEach((migration) => {
    consola.log(`[✓] ${migration.name}`);
  });

  results.forEach((result) => {
    consola.log(
      `[${result.direction === "Up" ? "`✓`" : "`⍻`"}] ${result.migrationName}`
    );
  });

  untouchedMigrationsAfter.forEach((migration) => {
    consola.log(`[ ] ${migration.name}`);
  });
}
