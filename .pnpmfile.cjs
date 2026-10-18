module.exports = {
	hooks: {
		readPackage(pkg) {
			if (pkg.name === '@arktype/attest' && pkg.version === '0.57.0') {
				// Attest's native TS adapter requires 7.1+, which is not stable yet.
				delete pkg.peerDependencies.typescript
				pkg.dependencies.typescript = '6.0.3'
			}
			return pkg
		},
	},
}
