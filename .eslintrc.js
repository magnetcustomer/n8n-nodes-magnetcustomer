module.exports = {
	root: true,
	env: {
		es6: true,
		node: true
	},

	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},
	ignorePatterns: [
		'.eslintrc.js',
		'package.json',
		'**/*.js',
		'node_modules/**',
		'dist/**',
	],
	plugins: [
		/**
		 * Plugin with lint rules for import/export syntax
		 * https://github.com/import-js/eslint-plugin-import
		 */
		'eslint-plugin-import',

		/**
		 * @typescript-eslint/eslint-plugin is required by eslint-config-airbnb-typescript
		 * See step 2: https://github.com/iamturns/eslint-config-airbnb-typescript#2-install-eslint-plugins
		 */
		'@typescript-eslint',

		/** https://github.com/sweepline/eslint-plugin-unused-imports */
		'unused-imports',

		/** https://github.com/sindresorhus/eslint-plugin-unicorn */
		'eslint-plugin-unicorn',

		/** https://github.com/wix-incubator/eslint-plugin-lodash */
		'eslint-plugin-lodash',
	],
	extends: [
		/**
		 * Config for typescript-eslint recommended ruleset (without type checking)
		 *
		 * https://github.com/typescript-eslint/typescript-eslint/blob/1c1b572c3000d72cfe665b7afbada0ec415e7855/packages/eslint-plugin/src/configs/recommended.ts
		 */
		'plugin:@typescript-eslint/recommended',

		/**
		 * Config for typescript-eslint recommended ruleset (with type checking)
		 *
		 * https://github.com/typescript-eslint/typescript-eslint/blob/1c1b572c3000d72cfe665b7afbada0ec415e7855/packages/eslint-plugin/src/configs/recommended-requiring-type-checking.ts
		 */
		'plugin:@typescript-eslint/recommended-requiring-type-checking',

		/**
		 * Config for Airbnb style guide for TS, /base to remove React rules
		 *
		 * https://github.com/iamturns/eslint-config-airbnb-typescript
		 * https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base/rules
		 */
		'eslint-config-airbnb-typescript/base',

		/**
		 * Config to disable ESLint rules covered by Prettier
		 *
		 * https://github.com/prettier/eslint-config-prettier
		 */
		'eslint-config-prettier',
	],

	rules: {
		// TODO: remove all the following rules
		eqeqeq: 'warn',
		'id-denylist': 'warn',
		'import/extensions': 'warn',
		'import/order': 'warn',
		'prefer-spread': 'warn',
		'import/no-extraneous-dependencies': 'warn',

		'@typescript-eslint/naming-convention': ['error', {selector: 'memberLike', format: null}],
		'@typescript-eslint/no-explicit-any': 'warn', //812 warnings, better to fix in separate PR
		'@typescript-eslint/no-non-null-assertion': 'warn', //665 errors, better to fix in separate PR
		'@typescript-eslint/no-unsafe-assignment': 'warn', //7084 problems, better to fix in separate PR
		'@typescript-eslint/no-unsafe-call': 'warn', //541 errors, better to fix in separate PR
		'@typescript-eslint/no-unsafe-member-access': 'warn', //4591 errors, better to fix in separate PR
		'@typescript-eslint/no-unsafe-return': 'warn', //438 errors, better to fix in separate PR
		'@typescript-eslint/no-unused-expressions': ['error', {allowTernary: true}],
		'@typescript-eslint/restrict-template-expressions': 'warn', //1152 errors, better to fix in separate PR
		'@typescript-eslint/unbound-method': 'warn',
		'@typescript-eslint/ban-ts-comment': ['warn', {'ts-ignore': true}],
		'@typescript-eslint/prefer-nullish-coalescing': 'warn',
		'@typescript-eslint/no-base-to-string': 'warn',
		'@typescript-eslint/no-redundant-type-constituents': 'warn',
		'@typescript-eslint/no-unsafe-argument': 'warn',
		'@typescript-eslint/prefer-optional-chain': 'warn',
		'@typescript-eslint/restrict-plus-operands': 'warn',
		'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
	},
	overrides: [
		{
			files: ['./credentials/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: {
				'n8n-nodes-base/cred-class-field-authenticate-type-assertion': 'error',
				'n8n-nodes-base/cred-class-field-display-name-missing-oauth2': 'error',
				'n8n-nodes-base/cred-class-field-display-name-miscased': 'error',
				'n8n-nodes-base/cred-class-field-documentation-url-missing': 'error',
				'n8n-nodes-base/cred-class-field-name-missing-oauth2': 'error',
				'n8n-nodes-base/cred-class-field-name-unsuffixed': 'error',
				'n8n-nodes-base/cred-class-field-name-uppercase-first-char': 'error',
				'n8n-nodes-base/cred-class-field-properties-assertion': 'error',
				'n8n-nodes-base/cred-class-field-type-options-password-missing': 'error',
				'n8n-nodes-base/cred-class-name-missing-oauth2-suffix': 'error',
				'n8n-nodes-base/cred-class-name-unsuffixed': 'error',
				'n8n-nodes-base/cred-filename-against-convention': 'error',
			},
		},
		{
			files: ['./nodes/**/*.ts'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: {
				'n8n-nodes-base/node-class-description-credentials-name-unsuffixed': 'error',
				'n8n-nodes-base/node-class-description-display-name-unsuffixed-trigger-node': 'error',
				'n8n-nodes-base/node-class-description-empty-string': 'error',
				'n8n-nodes-base/node-class-description-icon-not-svg': 'error',
				'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
				'n8n-nodes-base/node-class-description-inputs-wrong-trigger-node': 'error',
				'n8n-nodes-base/node-class-description-missing-subtitle': 'error',
				'n8n-nodes-base/node-class-description-non-core-color-present': 'error',
				'n8n-nodes-base/node-class-description-name-miscased': 'error',
				'n8n-nodes-base/node-class-description-name-unsuffixed-trigger-node': 'error',
				'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
				'n8n-nodes-base/node-dirname-against-convention': 'error',
				'n8n-nodes-base/node-execute-block-double-assertion-for-items': 'error',
				'n8n-nodes-base/node-execute-block-wrong-error-thrown': 'error',
				'n8n-nodes-base/node-filename-against-convention': 'error',
				'n8n-nodes-base/node-param-array-type-assertion': 'error',
				'n8n-nodes-base/node-param-color-type-unused': 'error',
				'n8n-nodes-base/node-param-default-missing': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-boolean': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-collection': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-fixed-collection': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-multi-options': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-number': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-simplify': 'error',
				'n8n-nodes-base/node-param-default-wrong-for-string': 'error',
				'n8n-nodes-base/node-param-description-boolean-without-whether': 'error',
				'n8n-nodes-base/node-param-description-comma-separated-hyphen': 'error',
				'n8n-nodes-base/node-param-description-empty-string': 'error',
				'n8n-nodes-base/node-param-description-excess-final-period': 'error',
				'n8n-nodes-base/node-param-description-excess-inner-whitespace': 'error',
				'n8n-nodes-base/node-param-description-identical-to-display-name': 'error',
				'n8n-nodes-base/node-param-description-line-break-html-tag': 'error',
				'n8n-nodes-base/node-param-description-lowercase-first-char': 'error',
				'n8n-nodes-base/node-param-description-miscased-id': 'error',
				'n8n-nodes-base/node-param-description-miscased-json': 'error',
				'n8n-nodes-base/node-param-description-miscased-url': 'error',
				'n8n-nodes-base/node-param-description-missing-final-period': 'error',
				'n8n-nodes-base/node-param-description-missing-for-ignore-ssl-issues': 'error',
				'n8n-nodes-base/node-param-description-missing-for-return-all': 'error',
				'n8n-nodes-base/node-param-description-missing-for-simplify': 'error',
				'n8n-nodes-base/node-param-description-missing-from-dynamic-multi-options': 'error',
				'n8n-nodes-base/node-param-description-missing-from-dynamic-options': 'error',
				'n8n-nodes-base/node-param-description-missing-from-limit': 'error',
				'n8n-nodes-base/node-param-description-unencoded-angle-brackets': 'error',
				'n8n-nodes-base/node-param-description-unneeded-backticks': 'error',
				'n8n-nodes-base/node-param-description-untrimmed': 'error',
				'n8n-nodes-base/node-param-description-url-missing-protocol': 'error',
				'n8n-nodes-base/node-param-description-weak': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-ignore-ssl-issues': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-limit': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-return-all': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-simplify': 'error',
				'n8n-nodes-base/node-param-description-wrong-for-upsert': 'error',
				'n8n-nodes-base/node-param-display-name-excess-inner-whitespace': 'error',
				'n8n-nodes-base/node-param-display-name-miscased-id': 'error',
				'n8n-nodes-base/node-param-display-name-miscased': 'error',
				'n8n-nodes-base/node-param-display-name-not-first-position': 'error',
				'n8n-nodes-base/node-param-display-name-untrimmed': 'error',
				'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options': 'error',
				'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'error',
				'n8n-nodes-base/node-param-display-name-wrong-for-simplify': 'error',
				'n8n-nodes-base/node-param-display-name-wrong-for-update-fields': 'error',
				'n8n-nodes-base/node-param-min-value-wrong-for-limit': 'error',
				'n8n-nodes-base/node-param-multi-options-type-unsorted-items': 'error',
				'n8n-nodes-base/node-param-name-untrimmed': 'error',
				'n8n-nodes-base/node-param-operation-option-action-wrong-for-get-many': 'error',
				'n8n-nodes-base/node-param-operation-option-description-wrong-for-get-many': 'error',
				'n8n-nodes-base/node-param-operation-option-without-action': 'error',
				'n8n-nodes-base/node-param-operation-without-no-data-expression': 'error',
				'n8n-nodes-base/node-param-option-description-identical-to-name': 'error',
				'n8n-nodes-base/node-param-option-name-containing-star': 'error',
				'n8n-nodes-base/node-param-option-name-duplicate': 'error',
				'n8n-nodes-base/node-param-option-name-wrong-for-get-many': 'error',
				'n8n-nodes-base/node-param-option-name-wrong-for-upsert': 'error',
				'n8n-nodes-base/node-param-option-value-duplicate': 'error',
				'n8n-nodes-base/node-param-options-type-unsorted-items': 'error',
				'n8n-nodes-base/node-param-placeholder-miscased-id': 'error',
				'n8n-nodes-base/node-param-placeholder-missing-email': 'error',
				'n8n-nodes-base/node-param-required-false': 'error',
				'n8n-nodes-base/node-param-resource-with-plural-option': 'error',
				'n8n-nodes-base/node-param-resource-without-no-data-expression': 'error',
				'n8n-nodes-base/node-param-type-options-missing-from-limit': 'error',
				'n8n-nodes-base/node-param-type-options-password-missing': 'error',
			},
		},
		{
			files: ['**/*.test.ts', '**/test/**/*.ts'],
			rules: {
				'import/no-extraneous-dependencies': 'off',
			},
		},
	]
};
