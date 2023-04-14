module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  rules: {
    // ! enabling @typescript-eslint/recommended-requiring-type-checking triggers a lot of errors
    // ! as type-checking is more strict than usual. In order to fix those errors progressively,
    // ! we have changed the configuration rules from error to warning for now to avoid crashing the deploy.
    // ! This does not mean the below rules are meant to stay as if, the warning must be fixed until
    // ! linter does not complain about a specific rule and can be safely removed from below.
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/require-await': 'warn',
    // ---
    'no-console': [1, { allow: ['info', 'error'] }],
    'react/jsx-props-no-spreading': [
      'error',
      {
        html: 'ignore',
        custom: 'ignore',
        exceptions: [''],
      },
    ],
    'import/no-named-as-default': 0,
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
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
            pattern: 'react**',
            group: 'builtin',
          },
          {
            pattern: '@react**',
            group: 'builtin',
          },
          {
            pattern: 'classnames',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: 'lodash-es/**',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: 'next/**',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: 'node_modules/**',
            group: 'builtin',
          },
          {
            pattern: 'hoc/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'store/**',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'hooks/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'containers/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'components/**',
            group: 'internal',
          },
          {
            pattern: 'services/**',
            group: 'internal',
            position: 'after',
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
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    // 'no-restricted-imports': [
    //   'error',
    //   {
    //     patterns: [{ group: ['lodash', '!lodash-es'], message: 'Use lodash-es instead' }],
    //   },
    // ],
  },
};
