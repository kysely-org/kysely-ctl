import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const DB_PATH = join(__dirname, 'example.db')

export const MOSHE_TABLE = 'moshe'
