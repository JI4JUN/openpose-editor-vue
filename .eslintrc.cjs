module.exports = {
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        project: 'tsconfig.json',
        ecmaFeatures: {
            jsx: true,
        },
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:vue/vue3-recommended',
        'prettier',
    ],
    root: true,
    env: {
        node: true,
        browser: true,
    },
    ignorePatterns: ['.eslintrc.cjs', 'vite.config.ts'],
    parserOptions: {
        parser: {
            ts: '@typescript-eslint/parser',
            '<template>': 'espree',
        },
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'no-console': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            {
                allowTypedFunctionExpressions: true,
            },
        ],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'import/namespace': 'off',
        'import/named': 'off',
        'import/default': 'off',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-unresolved': 'off',
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    ['parent', 'sibling', 'index', 'object'],
                    'type',
                ],
                pathGroups: [
                    {
                        pattern: '**/type',
                        group: 'type',
                    },
                ],
                distinctGroup: false,
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                'newlines-between': 'always',
            },
        ],
        'vue/no-unused-vars': 'error',
        'vue/multi-word-component-names': 'off',
    },
};
