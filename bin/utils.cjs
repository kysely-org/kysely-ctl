/**
 * Tries to require a package, returns true if successful.
 *
 * Inspired by acro5piano (Kay Gosho)'s  kysely-migration-cli
 * https://github.com/acro5piano/kysely-migration-cli/blob/main/bin/kysely-migration-cli.js
 *
 * @param {string | [string, unknown[]]} pkg
 * @returns {boolean}
 */
function safeRequire(pkg) {
  try {
    const [packageName, args] = Array.isArray(pkg) ? pkg : [pkg];
    const mod = require(packageName);
    if (args) {
      mod(...args);
    }
    return true;
  } catch (error) {
    return false;
  }
}
exports.safeRequire = safeRequire;
