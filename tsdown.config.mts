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
	copy: {
		from: ['./src/templates'],
		to: DIST_PATH,
	},
	dts: true,
	entry: ['./src/index.mts', './src/bin.mts'],
	exports: {
		bin: {
			kysely: './src/bin.mts',
		},
		enabled: 'local-only',
		exclude: ['bin'],
	},
	format: ['esm'],
	publint: {
		enabled: true,
	},
	shims: true,
	tsconfig: './tsconfig.prod.json',
})
