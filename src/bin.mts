#!/usr/bin/env node

import { process } from 'std-env'
import { buildCLI } from './cli.mjs'

const cli = buildCLI()

cli.parse(process.argv!.slice(2))
