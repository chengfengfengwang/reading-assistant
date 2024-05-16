module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 你自定义的规则
  },
};
