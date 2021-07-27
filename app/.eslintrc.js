module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    tsconfigRootDir: __dirname,
    project: './tsconfig.eslint.json',
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  extends: [
    'airbnb-typescript', // Uses the recommended rules from @eslint-plugin-react
    'airbnb/hooks', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:react/recommended', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:cypress/recommended',
  ],
  plugins: ['cypress', 'import'],
  rules: {
    // Place to specify ESLint rules.
    // Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    'no-console': [1, { allow: ['info', 'warn', 'error'] }],
    'react/jsx-props-no-spreading': [0, {}],
    'arrow-body-style': 0,
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'no-param-reassign': ['error', { props: false }],
    'import/order': [
      'warn',
      {
        groups: [['builtin'], 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'react** || @react**',
            group: 'builtin',
          },
          {
            pattern: 'node_modules/**',
            group: 'builtin',
          },
          {
            pattern: 'next/**',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: 'hoc/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'store/**',
            group: 'external',
          },
          {
            pattern: 'hooks/**',
            group: 'unknown',
          },
          {
            pattern: 'layout/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'components/**',
            group: 'internal',
          },
          {
            pattern: 'images/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'svgs/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: [
          'react',
        ],
      },
    ],
  },
};
