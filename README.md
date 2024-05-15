`kysely-ctl` is the official command-line tool for [Kysely](https://kysely.dev). We strive to make it [TypeScript](https://www.typescriptlang.org/)-first, cross-platform ([macOS](https://www.apple.com/macos), [Linux](https://www.linux.org/), and [Windows]()), and cross-runtime (Node.js, Bun, and Deno) compatible. We also aim to have feature parity with [Knex.js](https://knexjs.org)'s CLI.

## Install

```bash
npm i -D kysely-ctl
```

Make sure the following dependencies are also installed:

[kysely](https://github.com/kysely-org/kysely) - pretty obvious.

[c12](https://github.com/unjs/c12) - used to load the `kysely.config.ts` file in your project.

[citty](https://github.com/unjs/citty) - used to build and run the CLI.

[consola](https://github.com/unjs/consola) - used for output.

[nypm](https://github.com/unjs/nypm) - used to detect package manager.

[pathe](https://github.com/unjs/pathe) - used anywhere `node:path` module would've been used.

[pkg-types](https://github.com/unjs/pkg-types) - used to read `package.json` files.

[tsx](https://github.com/privatenumber/tsx) - used to import TS migration files (required only for Node.js as Bun/Deno support importing TS files out the box).

## Use

### Configuration

Currently, a `kysely.config.ts` file is required, in the project root OR `.config` folder. Run `kysely init` in your terminal to create one.

```ts
import { defineConfig } from "kysely-ctl";

export default defineConfig({
  dialect, // a Kysely dialect instance OR the name of an underlying driver library (e.g. `'pg'`).
  dialectConfig, // optional. when `dialect` is the name of an underlying driver library, `dialectConfig` is the options passed to the Kysely dialect that matches that library.
  migrations: { // optional.
    migrationFolder, // optional. name of migrations folder. default is `'migrations'`.
    migrator, // optional. a `Kysely` migrator instance. default is `Kysely`'s `Migrator`.
    provider, // optional. a `Kysely` migration provider instance. default is `kysely-ctl`'s `TSFileMigrationProvider`.
  },
  plugins, // optional. `Kysely` plugins list. default is `[]`.
});
```

### Commands

For more information run `kysely -h` in your terminal.

#### Migrate

The `migrate` module mirrors [Knex.js](https://knexjs.org) CLI's module of the same name.

```bash
knex migrate:<command>
```

Can now be called as either:

```bash
kysely migrate:<command>
```

or

```bash
kysely migrate <command>
```

> [!NOTE]
> `rollback` without `--all` flag is not supported, as [Kysely](https://kysely.dev) doesn't keep track of "migration batches".

## Acknowledgements

[acro5piano](https://github.com/acro5piano) who built [kysely-migration-cli](https://github.com/acro5piano/kysely-migration-cli) and inspired this project.

[UnJS](https://unjs.io)'s amazing tools that help power this project.

[Knex.js](https://knexjs.org) team for paving the way.
