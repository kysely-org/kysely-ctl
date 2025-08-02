<div style="width: 100%;">
  <img src="assets/banner.svg" alt="kysely in the terminal" width="100%" />
</div>

[![NPM Version](https://img.shields.io/npm/v/kysely-ctl?style=flat&label=latest)](https://github.com/kysely-org/kysely-ctl/releases/latest)
[![Tests](https://github.com/kysely-org/kysely-ctl/actions/workflows/test.yml/badge.svg)](https://github.com/kysely-org/kysely-ctl)
[![License](https://img.shields.io/github/license/kysely-org/kysely-ctl?style=flat)](https://github.com/kysely-org/kysely-ctl/blob/master/LICENSE)
[![Issues](https://img.shields.io/github/issues-closed/kysely-org/kysely-ctl?logo=github)](https://github.com/kysely-org/kysely-ctl/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
[![Pull Requests](https://img.shields.io/github/issues-pr-closed/kysely-org/kysely-ctl?label=PRs&logo=github&style=flat)](https://github.com/kysely-org/kysely-ctl/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc)
![GitHub contributors](https://img.shields.io/github/contributors/kysely-org/kysely-ctl)
[![Downloads](https://img.shields.io/npm/dw/kysely-ctl?logo=npm)](https://www.npmjs.com/package/kysely-ctl)

###### Join the discussion ⠀⠀⠀⠀⠀⠀⠀
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=flat&logo=discord&logoColor=white)](https://discord.gg/xyBJ3GwvAm)
[![Bluesky](https://img.shields.io/badge/Bluesky-0285FF?style=flat&logo=Bluesky&logoColor=white)](https://bsky.app/profile/kysely.dev)

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

`kysely-ctl` requires `kysely` >= 0.18.1 to be installed in your project/s.

### System-wide installation:

<details>
<summary>When installed globally, <code>kysely-ctl</code> will be available as <code>kysely</code> in your terminal,
anywhere.</summary>

#### Node.js:

```bash
npm i -g kysely-ctl
```

or:

```bash
pnpm add -g kysely-ctl
```

#### Bun

```bash
bun add -g kysely-ctl
```

#### Deno

```bash
deno install -g npm:kysely-ctl
```
</details>

### Project-scoped installation:

<details>
<summary>Alternatively, you can install <code>kysely-ctl</code> in your project as a dev dependency,
which will make it available as <code>kysely</code> in your project's <code>package.json</code>:</summary>

#### Node.js:

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

#### Bun

```bash
bun add -D kysely-ctl
```

#### Deno

```bash
deno add -D npm:kysely-ctl
```
</details>

## Use

### Configuration

<details>
<summary>Currently, a <code>kysely.config.ts</code> file is required, in the project root OR <code>.config</code>
folder. Run <code>kysely init</code> in your terminal to create one.</summary>

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

Alternatively, you can pass a `Kysely` instance, instead of `dialect`, `dialectConfig`
& `plugins`:

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

#### Environment-specific configuration

See [c12 docs](https://github.com/unjs/c12#environment-specific-configuration) and the following [example](https://github.com/kysely-org/kysely-ctl/blob/main/examples/node-esm-environments/.config/kysely.config.ts)

</details>

### Commands

For more information run `kysely -h` in your terminal.

#### Migrate

<details>
<summary>The <code>migrate</code> module mirrors <a href="https://knexjs.org">Knex.js</a> CLI's module of the
same name.</summary>

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

</details>

#### Seed

<details>
<summary>The <code>seed</code> module mirrors <a href="https://knexjs.org">Knex.js</a> CLI's module of the same
name.</summary>

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

</details>

#### SQL

<details>
<summary>The <code>sql</code> module allows you to run SQL queries directly from the command line using the <code>kysely</code> instance.</summary>

Single-query:

```bash
kysely sql "select 1"
```

or interactive mode:

```bash
kysely sql -f json

✔ sqlite ❯
select 1;
{
  "rows": [
    {
      "1": 1
    }
  ]
}

❯ sqlite ❯
exit
```

</details>

## Acknowledgements

[acro5piano](https://github.com/acro5piano) who built [kysely-migration-cli](https://github.com/acro5piano/kysely-migration-cli)
and inspired this project.

[UnJS](https://unjs.io)'s amazing tools that help power this project.

[Knex.js](https://knexjs.org) team for paving the way.
