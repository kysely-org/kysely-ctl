import { loadConfig } from 'c12'
import { findNearestFile } from 'pkg-types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getConfig } from '../src/config/get-config.mjs'

vi.mock('c12')
vi.mock('pkg-types')
vi.mock('../src/utils/jiti.mjs', () => ({ getJiti: vi.fn() }))

describe('getConfig', () => {
	afterEach(() => {
		vi.unstubAllEnvs()
		vi.resetAllMocks()
	})

	it('should use KYSELY_CTL_CONFIG_PATH when --config is not provided', async () => {
		vi.mocked(loadConfig).mockResolvedValue({
			config: {},
			configFile: 'kysely.config.mjs',
		})
		vi.stubEnv('KYSELY_CTL_CONFIG_PATH', '/from-env/dist/kysely.config.js')

		await getConfig({})

		expect(loadConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				configFile: 'kysely.config.js',
				cwd: '/from-env/dist',
			}),
		)
		expect(findNearestFile).not.toHaveBeenCalled()
	})

	it('should prefer --config over KYSELY_CTL_CONFIG_PATH', async () => {
		vi.mocked(loadConfig).mockResolvedValue({
			config: {},
			configFile: 'kysely.config.mjs',
		})
		vi.stubEnv('KYSELY_CTL_CONFIG_PATH', '/from-env/kysely.config.js')

		await getConfig({ config: '/from-flag/kysely.config.mjs' })

		expect(loadConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				configFile: 'kysely.config.mjs',
				cwd: '/from-flag',
			}),
		)
	})

	it('should fall back to discovery when KYSELY_CTL_CONFIG_PATH is empty', async () => {
		vi.mocked(loadConfig).mockResolvedValue({
			config: {},
			configFile: 'kysely.config.mjs',
		})
		vi.stubEnv('KYSELY_CTL_CONFIG_PATH', '')
		vi.mocked(findNearestFile).mockResolvedValue('/found/kysely.config.ts')

		await getConfig({})

		expect(findNearestFile).toHaveBeenCalledOnce()
		expect(loadConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				configFile: undefined,
				cwd: '/found',
				name: 'kysely',
			}),
		)
	})
})
