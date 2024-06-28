import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        allowOnly: false,
        typecheck: {
            enabled: true,
            ignoreSourceErrors: true,
        }
    }
})
