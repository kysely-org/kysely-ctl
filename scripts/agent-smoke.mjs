import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { createWriteStream } from 'node:fs'
import {
	appendFile,
	mkdir,
	mkdtemp,
	readFile,
	symlink,
	writeFile,
} from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { finished } from 'node:stream/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const artifacts = await mkdtemp(
	join(process.env.RUNNER_TEMP || tmpdir(), 'kysely-agent-'),
)
const project = join(artifacts, 'project')
const trace = join(artifacts, 'commands.jsonl')
const cli = join(root, 'dist/bin.mjs')
const model = 'opencode/big-pickle'

if (process.env.GITHUB_OUTPUT) {
	await appendFile(process.env.GITHUB_OUTPUT, `artifacts=${artifacts}\n`)
}
process.stdout.write(`Agent artifacts: ${artifacts}\n`)
await mkdir(join(project, '.config'), { recursive: true })
await mkdir(join(project, 'migrations'))
await mkdir(join(project, 'seeds'))
await mkdir(join(artifacts, 'bin'))
await symlink(join(root, 'node_modules'), join(project, 'node_modules'), 'dir')
await writeFile(
	join(project, 'package.json'),
	'{"name":"agent-smoke","type":"module"}',
)
await writeFile(
	join(project, '.config/kysely.config.mjs'),
	`
import Database from ${JSON.stringify(pathToFileURL(require.resolve('better-sqlite3')).href)}
import { SqliteDialect } from ${JSON.stringify(pathToFileURL(require.resolve('kysely')).href)}
export default {
  dialect: new SqliteDialect({ database: new Database(${JSON.stringify(join(project, 'example.db'))}) }),
  migrations: { allowJS: true }, seeds: { allowJS: true },
}
`,
)
await writeFile(
	join(project, 'migrations/001_create_moshe.mjs'),
	`
export async function up(db) { await db.schema.createTable('moshe').addColumn('id', 'integer').execute() }
export async function down(db) { await db.schema.dropTable('moshe').execute() }
`,
)
await writeFile(
	join(project, 'migrations/002_is_moshe.mjs'),
	`
export async function up(db) { await db.schema.alterTable('moshe').addColumn('is_moshe', 'boolean').execute() }
export async function down(db) { await db.schema.alterTable('moshe').dropColumn('is_moshe').execute() }
`,
)

// Observe the actual CLI process; do not trust the model's summary as test evidence.
await writeFile(join(artifacts, 'bin/package.json'), '{"type":"module"}')
await writeFile(
	join(artifacts, 'bin/kysely'),
	`#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { agent } from ${JSON.stringify(pathToFileURL(join(root, 'node_modules/std-env/dist/index.mjs')).href)}
const args = process.argv.slice(2)
const result = spawnSync(process.execPath, [${JSON.stringify(cli)}, ...args], { cwd: process.cwd(), encoding: 'utf8', timeout: 30000 })
appendFileSync(${JSON.stringify(trace)}, JSON.stringify({ args, agent, status: result.status, stdout: result.stdout, stderr: result.stderr }) + '\\n')
process.stdout.write(result.stdout || '')
process.stderr.write(result.stderr || '')
process.exit(result.status ?? 1)
`,
	{ mode: 0o755 },
)

await writeFile(
	join(project, 'opencode.json'),
	JSON.stringify({
		$schema: 'https://opencode.ai/config.json',
		model,
		small_model: model,
		enabled_providers: ['opencode'],
		autoupdate: false,
		share: 'disabled',
		snapshot: false,
		agent: { build: { steps: 30 } },
		permission: {
			'*': 'deny',
			bash: { '*': 'deny', kysely: 'allow', 'kysely *': 'allow' },
			read: 'allow',
			glob: 'allow',
			grep: 'allow',
			todowrite: 'allow',
		},
	}),
)

// Isolate agent configuration and credentials from both the developer and CI runner.
const env = {
	PATH: `${join(artifacts, 'bin')}:${process.env.PATH}`,
	TMPDIR: process.env.TMPDIR || tmpdir(),
	XDG_CONFIG_HOME: join(artifacts, 'config'),
	XDG_DATA_HOME: join(artifacts, 'data'),
	XDG_CACHE_HOME: join(artifacts, 'cache'),
	XDG_STATE_HOME: join(artifacts, 'state'),
	OPENCODE_DISABLE_DEFAULT_PLUGINS: '1',
	OPENCODE_DISABLE_EXTERNAL_SKILLS: '1',
	OPENCODE_DISABLE_CLAUDE_CODE: '1',
	OPENCODE_DISABLE_AUTOUPDATE: '1',
	OPENCODE_DISABLE_LSP_DOWNLOAD: '1',
	CI: 'true',
	NO_COLOR: '1',
}

// No formatting hints: exercise the CLI defaults as encountered by a coding agent.
const prompt = `You are automating a CLI workflow in this prepared SQLite project. The installed kysely CLI is on PATH. Discover its interface using help as needed, then complete this flow using only kysely commands:
1. Invoke the init command even though the config already exists, and confirm that it reports a skip without replacing the config.
2. Create an empty migration named agent_probe using the generated template unchanged.
3. List migrations, apply all pending migrations, then list migrations again.
4. Insert one row with id 1 and is_moshe true into the moshe table, then query that row and verify its values.
5. Create an empty seed named agent_probe using its template unchanged, list seeds and run them.
6. Roll back all migrations and list migrations once more to confirm they are pending again.
Do not modify the configuration or source files, install dependencies or ask questions. Only the kysely command is permitted in the shell. Use its documented interfaces and summarize the actual results.`

const agent = spawn(
	process.env.OPENCODE_EXECUTABLE || 'opencode',
	['run', '--pure', '--model', model, '--format', 'json', prompt],
	{
		cwd: project,
		env,
		detached: true,
		stdio: ['ignore', 'pipe', 'pipe'],
	},
)
const output = createWriteStream(join(artifacts, 'agent.jsonl'))
const errors = createWriteStream(join(artifacts, 'agent-stderr.log'))
agent.stdout.pipe(output)
agent.stderr.pipe(errors)
const timer = setTimeout(() => process.kill(-agent.pid, 'SIGTERM'), 300_000)
const [exitCode] = await once(agent, 'close').finally(() => clearTimeout(timer))
await Promise.all([finished(output), finished(errors)])
assert.equal(exitCode, 0, `OpenCode failed or timed out; inspect ${artifacts}`)

const observations = (await readFile(trace, 'utf8'))
	.trim()
	.split('\n')
	.map((line) => JSON.parse(line))
const successful = observations.filter(
	(entry) =>
		entry.status === 0 &&
		!entry.args.some((arg) =>
			['--help', '-h', '--version', '-v'].includes(arg),
		),
)
const commands = successful.map((entry) => {
	assert.equal(
		entry.agent,
		'opencode',
		'The actual coding agent must be detected',
	)
	return { ...entry, result: JSON.parse(entry.stdout) }
})
assert.ok(
	commands.some(
		(entry) =>
			!entry.args.includes('--json') &&
			!entry.args.includes('--format') &&
			!entry.args.includes('-f'),
	),
	'At least one command must use the detected-agent default',
)

function find(command, predicate = () => true) {
	const entry = commands.find(
		(entry) =>
			entry.args.slice(0, command.length).join(' ') === command.join(' ') &&
			predicate(entry.result),
	)
	assert.ok(
		entry,
		`Missing successful ${command.join(' ')} command; inspect ${trace}`,
	)
	return entry
}
function migrationCommand(name, predicate) {
	return commands.find(
		(entry) =>
			(entry.args[0] === `migrate:${name}` ||
				entry.args.slice(0, 2).join(' ') === `migrate ${name}`) &&
			predicate(entry.result),
	)
}
assert.equal(find(['init']).result.status, 'skipped')
assert.ok(
	migrationCommand(
		'make',
		(result) =>
			result.status === 'success' && result.path.includes('agent_probe'),
	),
)
assert.ok(
	migrationCommand(
		'latest',
		(result) => result.status === 'success' && result.migrations.length === 3,
	),
)
assert.ok(
	migrationCommand(
		'list',
		(result) =>
			result.migrations.length === 3 &&
			result.migrations.every((migration) => migration.status === 'executed'),
	),
)
find(['sql'], (result) =>
	result.rows.some((row) => row.id === 1 && row.is_moshe === 1),
)
assert.ok(
	commands.some(
		(entry) =>
			(entry.args[0] === 'seed:make' ||
				entry.args.slice(0, 2).join(' ') === 'seed make') &&
			entry.result.path?.includes('agent_probe'),
	),
)
find(['seed', 'list'], (result) =>
	result.seeds.some((seed) => seed.name.includes('agent_probe')),
)
assert.ok(
	commands.some(
		(entry) =>
			(entry.args[0] === 'seed:run' ||
				entry.args.slice(0, 2).join(' ') === 'seed run') &&
			entry.result.status === 'success' &&
			entry.result.seeds.length === 1,
	),
)
const rollback = migrationCommand(
	'rollback',
	(result) => result.status === 'success' && result.migrations.length === 3,
)
assert.ok(rollback)
assert.ok(
	commands
		.slice(commands.indexOf(rollback) + 1)
		.some(
			(entry) =>
				entry.result.migrations?.length === 3 &&
				entry.result.migrations.every(
					(migration) => migration.status === 'pending',
				),
		),
)

// Check the explicit opt-out before the subcommand as well as after it.
for (const args of [
	['--no-json', 'seed', 'list'],
	['seed', 'list', '--no-json'],
]) {
	const result = spawnSync(process.execPath, [cli, ...args], {
		cwd: project,
		env: { ...env, AI_AGENT: 'opencode' },
		encoding: 'utf8',
		timeout: 30000,
	})
	assert.equal(result.status, 0, result.stderr)
	assert.match(result.stdout, /Found 1 seed/)
}
await writeFile(
	join(artifacts, 'summary.json'),
	JSON.stringify(
		{ model, commands: commands.length, status: 'success' },
		null,
		2,
	),
)
process.stdout.write(
	`OpenCode completed the flow with JSON output: ${commands.length} successful commands.\n`,
)
