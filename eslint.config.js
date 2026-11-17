import eslintRecommended from '@eslint/js';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';

const eslintRecommendedConfig = eslintRecommended.configs.recommended;
const typescriptEslintRecommendedConfig = typescriptEslintPlugin.configs.recommended;

export default [
  // Configuración base para todos los archivos TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: typescriptEslintParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Globales de Node.js
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
      sonarjs: eslintPluginSonarjs,
    },
    rules: {
      // ========================================
      // Reglas Base de ESLint y TypeScript
      // ========================================
      ...eslintRecommendedConfig.rules,
      ...typescriptEslintRecommendedConfig.rules,

      // ========================================
      // Prettier Integration
      // ========================================
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          arrowParens: 'always',
        },
      ],

      // ========================================
      // TypeScript Específico
      // ========================================
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        // Interfaces deben empezar con I
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        // Types sin prefijo
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        // Clases en PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // Variables y funciones en camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Funciones en camelCase
        {
          selector: 'function',
          format: ['camelCase'],
        },
        // Propiedades privadas con _
        {
          selector: 'property',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
        // Métodos en camelCase
        {
          selector: 'method',
          format: ['camelCase'],
        },
        // Enums en PascalCase
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        // Enum members en PascalCase o UPPER_CASE
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        // Type parameters (generics) en PascalCase
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
        },
      ],

      // ========================================
      // Imports y Módulos
      // ========================================
      'no-unused-vars': 'off', // Usar la regla de TypeScript
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true, // Usar import/order en su lugar
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // npm packages
            'internal', // Absolute imports con alias @
            'parent', // Imports relativos del padre (..)
            'sibling', // Imports relativos del mismo nivel (.)
            'index', // Index del directorio actual
            'type', // Type imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@apps/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@context/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@shared/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],

      // ========================================
      // SonarJS - Calidad de Código
      // ========================================
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',

      // ========================================
      // Mejores Prácticas Generales
      // ========================================
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'no-param-reassign': 'warn',
      'no-return-await': 'warn',
      'require-await': 'warn',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // ========================================
      // Estilo de Código
      // ========================================
      'max-len': [
        'warn',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'max-lines': [
        'warn',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['warn', 10],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 4],

      // ========================================
      // Comentarios y Documentación
      // ========================================
      'spaced-comment': [
        'warn',
        'always',
        {
          markers: ['/'],
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },

  // ========================================
  // Configuración específica para archivos de test
  // ========================================

  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts', 'tests/**/*.test.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },

  // ========================================
  // Configuración para archivos de configuración
  // ========================================
  {
    files: ['*.config.js', '*.config.ts', 'eslint.config.js'],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // ========================================
  // Archivos a ignorar
  // ========================================
  {
    ignores: [
      'node_modules/',
      'dist/',
      'tests',
      'e2e/',
      'build/',
      'scripts/',
      'coverage/',
      'logs/',
      'sessions/',
      'performance/',
      '*.min.js',
      '*.d.ts',
      '*.test.ts',
      '.env',
      '.env.*',
      'vitest.*',
    ],
  },
  // ========================================================================
  // Reglas de Restricción de Capas (Arquitectura Hexagonal en Módulos)
  // ========================================================================
  {
    files: ['src/context/modules/**/domain/**/*.ts'],
    plugins: { import: eslintPluginImport },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/context/modules/*/domain/**/*',
              from: './src/context/modules/*/application/**/*',
              message: 'La capa de Dominio no puede depender de la capa de Aplicación.',
            },
            {
              target: './src/context/modules/*/domain/**/*',
              from: './src/context/modules/*/infrastructure/**/*',
              message: 'La capa de Dominio no puede depender de la capa de Infraestructura.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/context/modules/**/application/**/*.ts'],
    plugins: { import: eslintPluginImport },
    rules: {
      // La aplicación orquesta los casos de uso: Puede importar de domain pero NUNCA de infraestructura
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/context/modules/*/application/**/*',
              from: './src/context/modules/*/infrastructure/**/*',
              message: 'La capa de Aplicación no puede depender de la capa de Infraestructura.',
            },
          ],
        },
      ],
    },
  },
  // ========================================================================
  // Reglas de Restricción de Capas para el Contexto Compartido (Shared)
  // ========================================================================
  {
    files: ['src/context/shared/**/*.ts'],
    plugins: { import: eslintPluginImport },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Código compartido es genérico: NUNCA debe importar de un módulo de negocio específico
            {
              target: './src/context/shared/**/*',
              from: './src/context/modules/**/*',
              message:
                'El código en Shared es genérico y no puede importar de módulos específicos de negocio.',
            },
            // El dominio compartido es puro
            {
              target: './src/context/shared/domain/**/*',
              from: './src/context/shared/application/**/*',
              message: 'Shared Domain no puede depender de Shared Application.',
            },
            {
              target: './src/context/shared/domain/**/*',
              from: './src/context/shared/infrastructure/**/*',
              message: 'Shared Domain no puede depender de Shared Infrastructure.',
            },
            // La aplicación compartida no conoce la infraestructura
            {
              target: './src/context/shared/application//*',
              from: './src/context/shared/infrastructure//*',
              message: 'Shared Application no puede depender de Shared Infrastructure.',
            },
          ],
        },
      ],
    },
  },
  // ========================================================================
  // Reglas de Restricción de Capas para la Infraestructura de Módulos
  // ========================================================================
  {
    files: ['src/context/modules/**/infrastructure/**/*.ts'],
    plugins: { import: eslintPluginImport },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // 1. Evitar acoplamiento con la capa de entrega (apps)
            {
              target: './src/context/modules/*/infrastructure/**/*',
              from: './src/apps/**/*',
              message:
                'La capa de Infraestructura no puede importar elementos de la capa de entrega (src/apps/).',
            },
            // 2. Evitar que la infraestructura de un módulo importe de la infraestructura de OTRO módulo
            {
              target: './src/context/modules/([a-zA-Z0-9_-]+)/infrastructure/**/*',
              from: './src/context/modules/!( $1 )/infrastructure/**/*',
              message:
                'La infraestructura de un módulo no puede depender de la infraestructura de otro módulo diferente.',
            },
          ],
        },
      ],
    },
  },
  // ========================================================================
  // Reglas de Restricción para la Infraestructura Compartida (Shared Infra)
  // ========================================================================
  {
    files: ['src/context/shared/infrastructure/**/*.ts'],
    plugins: { import: eslintPluginImport },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // 1. Evitar acoplamiento con la capa de entrega global
            {
              target: './src/context/shared/infrastructure/**/*',
              from: './src/apps/**/*',
              message:
                'Shared Infrastructure es agnóstica y no puede importar nada de la capa de entrega (src/apps/).',
            },
            // 2. Evitar que herramientas compartidas conozcan las aplicaciones de los módulos
            {
              target: './src/context/shared/infrastructure/**/*',
              from: './src/context/modules/*/application/**/*',
              message:
                'Shared Infrastructure no puede orquestar casos de uso de ningún módulo de negocio.',
            },
            // 3. Evitar que herramientas compartidas conozcan la infraestructura de un módulo específico
            {
              target: './src/context/shared/infrastructure/**/*',
              from: './src/context/modules/*/infrastructure/**/*',
              message:
                'Shared Infrastructure no puede depender de implementaciones particulares de la infraestructura de un módulo.',
            },
          ],
        },
      ],
    },
  },
];
