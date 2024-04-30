#!/usr/bin/env node

import { process } from "std-env";
import { hideBin } from "yargs/helpers";
import { main } from "./index.mjs";

main(hideBin(process.argv!));
