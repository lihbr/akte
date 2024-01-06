module.exports = {
	root: true,
	extends: ["@antfu", "plugin:prettier/recommended"],
	rules: {
		"@typescript-eslint/consistent-type-imports": [
			"error",
			{
				prefer: "type-imports",
				fixStyle: "inline-type-imports",
				disallowTypeAnnotations: false,
			},
		],
		"@typescript-eslint/consistent-type-definitions": "off",
		"@typescript-eslint/explicit-module-boundary-types": "error",
		"@typescript-eslint/no-explicit-any": "error",
		"@typescript-eslint/no-non-null-assertion": "error",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
		],
		"antfu/top-level-function": "off",
		"n/prefer-global/process": "off",
		"no-cond-assign": ["error", "except-parens"],
		"no-fallthrough": "off",
		"padding-line-between-statements": [
			"error",
			{ blankLine: "always", prev: "*", next: "return" },
		],
	},
	overrides: [
		{
			files: "*.cjs",
			rules: {
				"@typescript-eslint/no-var-requires": "off",
			},
		},
	],
};
