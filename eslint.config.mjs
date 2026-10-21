import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

// I gruppi di import vietati dai confini dell'architettura §3. Stanno qui perché più blocchi li
// combinano: le librerie dei fornitori valgono per tutti tranne gli adapter, il database non si
// importa dalla troupe, e l'interfaccia vede solo i contratti.
const PROVIDER_LIBRARIES = {
  group: ['ai', '@ai-sdk/*', '@fal-ai/*', 'openai', '@anthropic-ai/*', '@google/*', 'elevenlabs'],
  message:
    'Le librerie dei fornitori si importano solo in packages/troupe/src/adapters (architettura §3).',
};

const DATABASE_FROM_TROUPE = {
  group: ['@filmzy/db'],
  message:
    'La troupe non importa il database: riceve la configurazione da una ConfigSource (architettura §3).',
};

const WORKSPACE_FROM_WEB = {
  group: ['@filmzy/*', '!@filmzy/contracts'],
  message: "L'interfaccia importa solo @filmzy/contracts (architettura §3).",
};

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

  // I confini dell'architettura §3 sono imposti qui, non affidati alla buona volontà. Le regole
  // si compongono dai gruppi definiti in cima al file, perché in ESLint l'ultimo blocco che
  // combacia *sostituisce* la regola: un blocco più specifico deve ripetere i gruppi che valgono
  // comunque.
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [PROVIDER_LIBRARIES] }] },
  },

  // La troupe riceve la configurazione da una `ConfigSource` e non legge il database.
  {
    files: ['packages/troupe/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [PROVIDER_LIBRARIES, DATABASE_FROM_TROUPE] }],
    },
  },

  // Gli adapter sono l'unico posto da cui si parla ai fornitori.
  {
    files: ['packages/troupe/src/adapters/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [DATABASE_FROM_TROUPE] }] },
  },

  // Il codice dell'interfaccia gira nel browser: niente moduli né variabili di Node. (La
  // configurazione di Vite sta fuori da `src/` e può usarli.) I tipi di Node restano visibili a
  // TypeScript perché servono a `vite.config.ts`, quindi questo controllo lo fa ESLint.
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            PROVIDER_LIBRARIES,
            WORKSPACE_FROM_WEB,
            { group: ['node:*'], message: 'Il codice del browser non può usare Node.' },
          ],
        },
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
