import { type PackageJson, readPackageJSON } from 'pkg-types'
import { type HasCWD, getCWD } from '../config/get-cwd.mjs'

export interface GetPackageJSONOptions {
	id?: string
	startingFrom?: string
}

const PACKAGE_JSONS: Record<string, PackageJson> = {}

export async function getConsumerPackageJSON(
	args?: HasCWD,
): Promise<PackageJson> {
	return await getPackageJSON({ startingFrom: getCWD(args) })
}

export async function getCTLPackageJSON(): Promise<PackageJson> {
	return await getPackageJSON({ id: 'kysely-ctl' })
}

async function getPackageJSON(
	options: GetPackageJSONOptions,
): Promise<PackageJson> {
	const { id, startingFrom = __dirname } = options

	return (PACKAGE_JSONS[`${String(id)}_${startingFrom}`] ||=
		await readPackageJSON(id, { startingFrom }))
}
