`kysely-ctl` is the official command-line tool for [Kysely](https://kysely.dev). 
We strive to make it [TypeScript](https://www.typescriptlang.org/)-first, cross-platform 
([macOS](https://www.apple.com/macos), [Linux](https://www.linux.org/), and [Windows](https://www.microsoft.com/en-us/windows)), 
cross-runtime ([Node.js](https://nodejs.org/), [Bun](https://bun.sh/), and [Deno](https://deno.com/)), 
and cross-module system ([ESM](https://nodejs.org/api/esm.html#modules-ecmascript-modules) 
and [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules)) compatible. 
We also aim to have feature parity with [Knex.js](https://knexjs.org)'s CLI.

> [!NOTE]
> This is a work in progress. Please report any issues you encounter or suggest 
any ideas you have in the [issues](https://github.com/kysely-org/kysely-ctl/issues) 
section or in [kysely's discord server](https://discord.gg/xyBJ3GwvAm).

## Install

```bash
npm i -D kysely-ctl
```

Requires `kysely` >= 0.18.1.

## Use

### Configuration

Currently, a `kysely.config.ts` file is required, in the project root OR `.config` 
folder. Run `kysely init` in your terminal to create one.

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

The `migrate` module mirrors [Knex.js](https://knexjs.org) CLI's module of the 
same name.

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
> `rollback` without `--all` flag is not supported, as [Kysely](https://kysely.dev) 
doesn't keep track of "migration batches".

#### Seed

The `seed` module mirrors [Knex.js](https://knexjs.org) CLI's module of the same 
name.

```bash
knex seed:<command>
```

Can now be called as either:

```bash
kysely seed:<command>
```

or

```bash
kysely seed <command>
```

> [!NOTE]
> We also provide `kysely seed list`, which is not part of [Knex.js](https://knexjs.org) 
CLI.

## Acknowledgements

[acro5piano](https://github.com/acro5piano) who built [kysely-migration-cli](https://github.com/acro5piano/kysely-migration-cli) 
and inspired this project.

[UnJS](https://unjs.io)'s amazing tools that help power this project.

[Knex.js](https://knexjs.org) team for paving the way.
