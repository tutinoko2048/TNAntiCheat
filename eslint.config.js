// @ts-check
import globals from 'globals';
import eslintPlugin from '@eslint/js';
import jsdocPlugin from 'eslint-plugin-jsdoc';
// @ts-expect-error
import importPlugin from 'eslint-plugin-import';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['*.js', '*.d.ts']
  },
  {
    ignores: ['scripts/util/secret.js'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
  },
  eslintPlugin.configs.recommended,
  {
    plugins: {
      jsdoc: jsdocPlugin,
      import: importPlugin
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-empty': 'off',
      'block-spacing': 'warn',
      'arrow-spacing': 'warn',
      'space-before-blocks': 'warn',
      'keyword-spacing': 'warn',
      'no-irregular-whitespace': 'off',
      'no-class-assign': 'off',
      'jsdoc/no-undefined-types': 1,
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.d.ts']
        }
      }
    }
  },
]