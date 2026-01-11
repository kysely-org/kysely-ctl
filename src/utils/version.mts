import { readFile } from 'node:fs/promises'
import { parseYAML } from 'confbox'
import { consola } from 'consola'
import type { PackageManagerName } from 'nypm'
import { ofetch } from 'ofetch'
import { join } from 'pathe'
import { findWorkspaceDir, type PackageJson, readPackageJSON } from 'pkg-types'
import { isBun, isCI, runtime } from 'std-env'
import { getCWD } from '../config/get-cwd.mjs'
import { isObject } from './is-object.mjs'
import { getPackageManager } from './package-manager.mjs'
import { getConsumerPackageJSON, getCTLPackageJSON } from './pkg-json.mjs'

/**
 * Returns the version of the Kysely package.
 */
export async function getKyselyInstalledVersion(): Promise<string | null> {
	try {
		const pkgJSON = await getConsumerPackageJSON()

		const version = getVersionFromPackageJSON('kysely', pkgJSON)

		if (!version) {
			return null
		}

		if (version.startsWith('catalog:')) {
			return await getVersionFromCatalog('kysely', version)
		}

		return version
	} catch {
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
	} catch {
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

	return pkgJSON.dependencies?.[name] || pkgJSON.devDependencies?.[name] || null
}

/**
 * Prints the version of the CLI and the Kysely package.
 */
export async function printInstalledVersions(): Promise<void> {
	const [cliVersion, kyselyVersion] = await Promise.all([
		getCTLInstalledVersion(),
		getKyselyInstalledVersion(),
	])

	consola.log(
		`kysely ${kyselyVersion ? `v${kyselyVersion}` : '[not installed]'}`,
	)
	consola.log(`kysely-ctl v${cliVersion}`)
}

async function getKyselyLatestVersion(): Promise<string> {
	return await getPackageLatestVersion('kysely')
}

async function getCTLLatestVersion(): Promise<string> {
	return await getPackageLatestVersion('kysely-ctl')
}

async function getPackageLatestVersion(packageName: string): Promise<string> {
	const response = await ofetch<{ 'dist-tags': { latest: string } }>(
		`https://registry.npmjs.org/${packageName}`,
	)

	return response['dist-tags'].latest
}

export async function printUpgradeNotice(args: {
	'outdated-check'?: boolean
	version?: boolean
}): Promise<void> {
	if (args.version || args['outdated-check'] === false || isCI) {
		return
	}

	const [
		kyselyInstalledVersion,
		kyselyLatestVersion,
		ctlInstalledVersion,
		ctlLatestVersion,
	] = await Promise.all([
		getKyselyInstalledVersion(),
		getKyselyLatestVersion(),
		getCTLInstalledVersion(),
		getCTLLatestVersion(),
	])

	const notices: [
		prettyName: string,
		packageName: string,
		installedVersion: string | null,
		latestVersion: string,
	][] = []

	if (!kyselyInstalledVersion?.includes(kyselyLatestVersion)) {
		notices.push([
			'Kysely',
			'kysely',
			kyselyInstalledVersion,
			kyselyLatestVersion,
		])
	}

	if (!ctlInstalledVersion?.includes(ctlLatestVersion)) {
		notices.push([
			'KyselyCTL',
			'kysely-ctl',
			ctlInstalledVersion,
			ctlLatestVersion,
		])
	}

	if (!notices.length) {
		return
	}

	const { command, name: packageManagerName } = await getPackageManager()

	const installGloballyCommand = (
		{
			bun: (name) => `add -g ${name}@latest`,
			deno: (name) => `install -g -f npm:${name}@latest`,
			npm: (name) => `i -g ${name}@latest`,
			pnpm: (name) => `add -g ${name}@latest`,
			// doesn't support global installs in modern versions.
			yarn: (name) => `add -D ${name}@latest`,
		} satisfies Record<PackageManagerName, (name: string) => string>
	)[packageManagerName]

	const installLocallyCommand = (
		{
			bun: (name, dev?) => `add ${dev ? '-D ' : ''}${name}@latest`,
			deno: (name, dev?) => `install ${dev ? '-D ' : ''}npm:${name}@latest`,
			npm: (name, dev?) => `i ${dev ? '-D ' : ''}${name}@latest`,
			pnpm: (name, dev?) => `add ${dev ? '-D ' : ''}${name}@latest`,
			yarn: (name, dev?) => `add ${dev ? '-D ' : ''}${name}@latest`,
		} satisfies Record<
			PackageManagerName,
			(name: string, dev?: boolean) => string
		>
	)[packageManagerName]

	consola.box(
		notices
			.map(
				([prettyName, name, installedVersion, latestVersion]) =>
					`A new ${prettyName} version is available: ${installedVersion ? `v${installedVersion}` : '[not installed]'} -> v${latestVersion}\nRun \`${
						command
					} ${
						name === 'kysely-ctl'
							? installGloballyCommand(name)
							: installLocallyCommand(name)
					}\` to upgrade.`,
			)
			.join('\n\n'),
	)
}

interface CatalogContainer {
	catalog?: Record<string, string>
	catalogs?: Record<string, Record<string, string>>
}

async function getVersionFromCatalog(
	packageName: string,
	catalogReference: string,
): Promise<string | null> {
	const workspaceDirPath = await findWorkspaceDir(getCWD())

	consola.debug('workspaceDirPath', workspaceDirPath)

	if (runtime === 'node') {
		const rawWorkspaceFile = await readFile(
			join(workspaceDirPath, 'pnpm-workspace.yaml'),
			{ encoding: 'utf8' },
		)

		consola.debug('rawWorkspaceFile', rawWorkspaceFile)

		const workspaceFile = parseYAML<CatalogContainer>(rawWorkspaceFile)

		consola.debug('workspaceFile', workspaceFile)

		return extractVersionFromCatalogContainer(
			workspaceFile,
			packageName,
			catalogReference,
		)
	}

	if (isBun) {
		const rootPkgJSON = (await readPackageJSON(workspaceDirPath)) as Omit<
			PackageJson,
			'workspaces'
		> & { workspaces?: string[] | CatalogContainer }

		consola.debug('rootPkgJSON', rootPkgJSON)

		const { workspaces } = rootPkgJSON

		if (!isObject(workspaces)) {
			return null
		}

		return extractVersionFromCatalogContainer(
			workspaces,
			packageName,
			catalogReference,
		)
	}

	return null
}

const CATALOG_REFERENCE_PREFIX_REGEX = /^catalog:/

function extractVersionFromCatalogContainer(
	container: CatalogContainer,
	packageName: string,
	catalogReference: string,
): string | null {
	if (catalogReference === 'catalog:') {
		return container.catalog?.[packageName] || null
	}

	const catalogName = catalogReference.replace(
		CATALOG_REFERENCE_PREFIX_REGEX,
		'',
	)

	return container.catalogs?.[catalogName]?.[packageName] || null
}
