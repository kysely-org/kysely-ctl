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

### Prerequisites:

`kysely-ctl` requires `kysely` >= 0.18.1 to be installed.

### Node.js:

```bash
npm i -D kysely-ctl
```

or:

```bash
yarn add -D kysely-ctl
```

or:

```bash
pnpm add -D kysely-ctl
```

### Bun

```bash
bun add -D kysely-ctl
```

### Deno

```bash
deno add -D npm:kysely-ctl
```

## Use

### Configuration

Currently, a `kysely.config.ts` file is required, in the project root OR `.config` 
folder. Run `kysely init` in your terminal to create one.

```ts
import { defineConfig } from "kysely-ctl";

export default defineConfig({
  destroyOnExit, // optional. dictates whether the (resolved) `kysely` instance should be destroyed when a command is finished executing. default is `true`.
  dialect, // a `Kysely` dialect instance OR the name of an underlying driver library (e.g. `'pg'`).
  dialectConfig, // optional. when `dialect` is the name of an underlying driver library, `dialectConfig` is the options passed to the Kysely dialect that matches that library.
  migrations: { // optional.
    allowJS, // optional. controls whether `.js`, `.cjs` or `.mjs` migrations are allowed. default is `false`.
    getMigrationPrefix, // optional. a function that returns a migration prefix. affects `migrate make` command. default is `() => ${Date.now()}_`.
    migrationFolder, // optional. name of migrations folder. default is `'migrations'`.
    migrator, // optional. a `Kysely` migrator instance factory of shape `(db: Kysely<any>) => Migrator | Promise<Migrator>`. default is `Kysely`'s `Migrator`.
    provider, // optional. a `Kysely` migration provider instance. default is `kysely-ctl`'s `TSFileMigrationProvider`.
  },
  plugins, // optional. `Kysely` plugins list. default is `[]`.
  seeds: { // optional.
    allowJS, // optional. controls whether `.js`, `.cjs` or `.mjs` seeds are allowed. default is `false`.
    getSeedPrefix, // optional. a function that returns a seed prefix. affects `seed make` command. default is `() => ${Date.now()}_`.
    provider, // optional. a seed provider instance. default is `kysely-ctl`'s `FileSeedProvider`.
    seeder, // optional. a seeder instance factory of shape `(db: Kysely<any>) => Seeder | Promise<Seeder>`. default is `kysely-ctl`'s `Seeder`.
    seedFolder, // optional. name of seeds folder. default is `'seeds'`.
  }
});
```

Alternatively, you can pass a `Kysely` instance, instead of `dialect`, `dialectConfig` & `plugins`:

```ts
import { defineConfig } from "kysely-ctl";
import { kysely } from 'path/to/kysely/instance';

export default defineConfig({
  destroyOnExit, // optional. dictates whether the `kysely` instance should be destroyed when a command is finished executing. default is `true`.
  // ...
  kysely,
  // ...
});
```

To use Knex's timestamp prefixes:

```ts
import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";

export default defineConfig({
  // ...
  migrations: {
    // ...
    getMigrationPrefix: getKnexTimestampPrefix,
    // ...
  },
  // ...
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
