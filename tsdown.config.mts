import { cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'pathe'
import { defineConfig } from 'tsdown'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DIST_PATH = join(__dirname, 'dist')

export default defineConfig({
	attw: {
		enabled: true,
		level: 'error',
		profile: 'esm-only',
	},
	clean: true,
	dts: true,
	entry: ['./src/index.mts', './src/bin.mts'],
	exports: {
		enabled: 'local-only',
		exclude: ['bin'],
	},
	format: ['esm'],
	onSuccess: async function copyTemplatesToDist(): Promise<void> {
		await cp(join(__dirname, 'src/templates'), join(DIST_PATH, 'templates'), {
			recursive: true,
		})
	},
	shims: true,
})
