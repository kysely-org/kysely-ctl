import { consola } from 'consola'
import { ofetch } from 'ofetch'
import type { PackageJson } from 'pkg-types'
import { isCI } from 'std-env'
import type { HasCWD } from '../config/get-cwd.mjs'
import { getPackageManager } from './package-manager.mjs'
import { getCTLPackageJSON, getConsumerPackageJSON } from './pkg-json.mjs'

/**
 * Returns the version of the Kysely package.
 */
export async function getKyselyInstalledVersion(
	args: HasCWD,
): Promise<string | null> {
	try {
		const pkgJSON = await getConsumerPackageJSON(args)

		return getVersionFromPackageJSON('kysely', pkgJSON)
	} catch (err) {
		return null
	}
}

/**
 * Returns the version of this package.
 */
export async function getCTLInstalledVersion(): Promise<string | null> {
	try {
		const pkgJSON = await getCTLPackageJSON()

		return getVersionFromPackageJSON('kysely-ctl', pkgJSON)
	} catch (err) {
		return null
	}
}

function getVersionFromPackageJSON(
	name: string,
	pkgJSON: PackageJson,
): string | null {
	if (pkgJSON.name === name) {
		return pkgJSON.version || null
	}

	const rawVersion =
		pkgJSON.dependencies?.[name] || pkgJSON.devDependencies?.[name]

	return rawVersion?.replace(/^[\^~]?(.+)$/, '$1') || null
}

/**
 * Prints the version of the CLI and the Kysely package.
 */
export async function printInstalledVersions(args: HasCWD): Promise<void> {
	const [cliVersion, kyselyVersion] = await Promise.all([
		getCTLInstalledVersion(),
		getKyselyInstalledVersion(args),
	])

	consola.log(
		`kysely ${kyselyVersion ? `v${kyselyVersion}` : '[not installed]'}`,
	)
	consola.log(`kysely-ctl v${cliVersion}`)
}

export async function getKyselyLatestVersion(): Promise<string> {
	return await getPackageLatestVersion('kysely')
}

export async function getCTLLatestVersion(): Promise<string> {
	return await getPackageLatestVersion('kysely-ctl')
}

async function getPackageLatestVersion(packageName: string): Promise<string> {
	const response = await ofetch<{ 'dist-tags': { latest: string } }>(
		`https://registry.npmjs.org/${packageName}`,
	)

	return response['dist-tags'].latest
}

export async function printUpgradeNotice(
	args: HasCWD & { 'outdated-check'?: boolean },
): Promise<void> {
	if (args['outdated-check'] === false || isCI) {
		return
	}

	const [
		kyselyInstalledVersion,
		kyselyLatestVersion,
		ctlInstalledVersion,
		ctlLatestVersion,
	] = await Promise.all([
		getKyselyInstalledVersion(args),
		getKyselyLatestVersion(),
		getCTLInstalledVersion(),
		getCTLLatestVersion(),
	])

	const notices: [string, string, string][] = []

	if (
		kyselyInstalledVersion &&
		kyselyInstalledVersion !== kyselyLatestVersion
	) {
		notices.push(['Kysely', 'kysely', kyselyLatestVersion])
	}

	if (ctlInstalledVersion !== ctlLatestVersion) {
		notices.push(['KyselyCTL', 'kysely-ctl', ctlLatestVersion])
	}

	if (!notices.length) {
		return
	}

	const packageManager = await getPackageManager(args)

	const installCommand = {
		[packageManager.name]: 'install',
		bun: 'add',
		pnpm: 'add',
		yarn: 'add',
	}[packageManager.name]

	consola.box(
		notices
			.map(
				([prettyName, name, latestVersion]) =>
					`A new version of ${prettyName} is available: v${latestVersion}\nRun \`${
						packageManager.command
					} ${installCommand} ${
						packageManager.name === 'deno' ? 'npm:' : ''
					}${name}@latest\` to upgrade.`,
			)
			.join('\n\n'),
	)
}
