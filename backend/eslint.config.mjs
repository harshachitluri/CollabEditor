export default {
  ignores: ['dist/', 'node_modules/'],
  root: true,
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
};
