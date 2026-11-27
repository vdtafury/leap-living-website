import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Enforce AGENTS.md §5 module & layer boundaries.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/server/bootstrap.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*/domain/*', '@/modules/*/application/*', '@/modules/*/infrastructure/*'],
              message: 'Import from a module public entry point (@/modules/<name>) instead of its internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['next/*', 'react', 'react-dom', '@prisma/*', '@/server/*'],
              message: 'Domain modules must stay pure and must not import framework, Prisma, or server code.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'generated/**', 'storage/**', 'deploy-out/**', 'next-env.d.ts']),
])
