#!/usr/bin/env node

const { installTSTranspiler } = require("./ts-transpilers.cjs");

/**
 * @returns {void}
 */
function main() {
  installTSLoaders();
}

main();
