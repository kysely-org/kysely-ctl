import type { Extension } from '../arguments/extension.mjs'
import { getConsumerPackageJSON } from './pkg-json.mjs'

export async function getTemplateExtension(
	extension: Extension,
): Promise<Extension> {
	if (extension === 'js') {
		const pkgJSON = await getConsumerPackageJSON()

		return pkgJSON.type === 'module' ? 'mjs' : 'cjs'
	}

	return extension === 'cjs' || extension === 'mjs' ? extension : 'ts'
}
