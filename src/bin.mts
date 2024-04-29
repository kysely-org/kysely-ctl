#!/usr/bin/env node

import { process } from "std-env";
import { main } from "./index.mjs";

console.log(process.argv);

main();
