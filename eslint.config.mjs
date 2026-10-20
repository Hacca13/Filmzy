import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/node_modules/**',
      'bench-output/**',
    ],
  },

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    plugins: {
      '@eslint-community/eslint-comments': eslintComments,
    },
    rules: {
      // "Niente any senza un commento che spieghi perché" (CLAUDE.md): l'eccezione si scrive
      // con `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- motivo`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      '@eslint-community/eslint-comments/disable-enable-pair': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },

  // In NestJS una classe può essere vuota e contare solo per il decoratore (es. `@Module()`).
  {
    files: ['apps/api/**/*.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  },

  // Il codice dell'interfaccia gira nel browser: niente moduli né variabili di Node. (La
  // configurazione di Vite sta fuori da `src/` e può usarli.) I tipi di Node restano visibili a
  // TypeScript perché servono a `vite.config.ts`, quindi questo controllo lo fa ESLint.
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['node:*'], message: 'Il codice del browser non può usare Node.' }] },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'process', message: 'Il codice del browser non ha `process`.' },
        { name: 'Buffer', message: 'Il codice del browser non ha `Buffer`.' },
      ],
    },
  },

  // I file JavaScript (come questo) non hanno tipi: niente regole che li richiedono.
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
