#!/usr/bin/env node

import { process } from 'std-env'
import { buildCLI } from './cli.mjs'

const cli = buildCLI()

// biome-ignore lint/style/noNonNullAssertion: should fail if argv doesn't exist.
cli.parse(process.argv!.slice(2))
