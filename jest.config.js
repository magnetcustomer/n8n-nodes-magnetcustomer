/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/__tests__'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			tsconfig: 'tsconfig.json',
			diagnostics: false,
		}],
	},
	clearMocks: true,
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'credentials/**/*.ts',
		'!**/*.node.json',
		'!**/dist/**',
	],
};
