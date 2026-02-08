// // eslint.config.js
// import eslintPluginPrettier from 'eslint-plugin-prettier';
// import eslintPluginImport from 'eslint-plugin-import';
// import eslintPluginSonarjs from 'eslint-plugin-sonarjs';
// import typescriptEslintParser from '@typescript-eslint/parser';
// import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
// import eslintRecommended from '@eslint/js';

// const eslintRecommendedConfig = eslintRecommended.configs.recommended;
// const typescriptEslintRecommendedConfig = typescriptEslintPlugin.configs.recommended;

// export default [
//   // Configuración base para todos los archivos TypeScript
//   {
//     files: ['**/*.ts', '**/*.tsx'],
//     languageOptions: {
//       ecmaVersion: 2022,
//       sourceType: 'module',
//       parser: typescriptEslintParser,
//       parserOptions: {
//         project: './tsconfig.json',
//         // tsconfigRootDir: '.',
//       },
//       globals: {
//         // Globales de Node.js
//         console: 'readonly',
//         process: 'readonly',
//         Buffer: 'readonly',
//         __dirname: 'readonly',
//         __filename: 'readonly',
//         module: 'readonly',
//         require: 'readonly',
//       },
//     },
//     plugins: {
//       '@typescript-eslint': typescriptEslintPlugin,
//       prettier: eslintPluginPrettier,
//       import: eslintPluginImport,
//       sonarjs: eslintPluginSonarjs,
//     },
//     rules: {
//       // ========================================
//       // Reglas Base de ESLint y TypeScript
//       // ========================================
//       ...eslintRecommendedConfig.rules,
//       ...typescriptEslintRecommendedConfig.rules,

//       // ========================================
//       // Prettier Integration
//       // ========================================
//       'prettier/prettier': [
//         'error',
//         {
//           semi: true,
//           singleQuote: true,
//           tabWidth: 2,
//           trailingComma: 'es5',
//           printWidth: 100,
//           arrowParens: 'always',
//         },
//       ],

//       // ========================================
//       // TypeScript Específico
//       // ========================================
//       '@typescript-eslint/no-unused-vars': [
//         'warn',
//         {
//           argsIgnorePattern: '^_',
//           varsIgnorePattern: '^_',
//           caughtErrorsIgnorePattern: '^_',
//         },
//       ],
//       '@typescript-eslint/explicit-function-return-type': [
//         'warn',
//         {
//           allowExpressions: true,
//           allowTypedFunctionExpressions: true,
//           allowHigherOrderFunctions: true,
//         },
//       ],
//       '@typescript-eslint/no-explicit-any': 'warn',
//       '@typescript-eslint/no-non-null-assertion': 'warn',
//       '@typescript-eslint/naming-convention': [
//         'error',
//         // Interfaces deben empezar con I
//         {
//           selector: 'interface',
//           format: ['PascalCase'],
//           prefix: ['I'],
//         },
//         // Types sin prefijo
//         {
//           selector: 'typeAlias',
//           format: ['PascalCase'],
//         },
//         // Clases en PascalCase
//         {
//           selector: 'class',
//           format: ['PascalCase'],
//         },
//         // Variables y funciones en camelCase
//         {
//           selector: 'variable',
//           format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
//           leadingUnderscore: 'allow',
//         },
//         // Funciones en camelCase
//         {
//           selector: 'function',
//           format: ['camelCase'],
//         },
//         // Propiedades privadas con _
//         {
//           selector: 'property',
//           modifiers: ['private'],
//           format: ['camelCase'],
//           leadingUnderscore: 'require',
//         },
//         // Métodos en camelCase
//         {
//           selector: 'method',
//           format: ['camelCase'],
//         },
//         // Enums en PascalCase
//         {
//           selector: 'enum',
//           format: ['PascalCase'],
//         },
//         // Enum members en PascalCase o UPPER_CASE
//         {
//           selector: 'enumMember',
//           format: ['PascalCase', 'UPPER_CASE'],
//         },
//         // Type parameters (generics) en PascalCase
//         {
//           selector: 'typeParameter',
//           format: ['PascalCase'],
//         },
//       ],

//       // ========================================
//       // Imports y Módulos
//       // ========================================
//       'no-unused-vars': 'off', // Usar la regla de TypeScript
//       'import/extensions': [
//         'error',
//         'ignorePackages',
//         {
//           js: 'never',
//           jsx: 'never',
//           ts: 'never',
//           tsx: 'never',
//         },
//       ],
//       'import/no-unresolved': 'error',
//       'import/no-duplicates': 'error',
//       'import/no-cycle': 'warn',
//       'import/no-self-import': 'error',
//       'import/no-useless-path-segments': 'error',
//       'sort-imports': [
//         'error',
//         {
//           ignoreCase: false,
//           ignoreDeclarationSort: true, // Usar import/order en su lugar
//           ignoreMemberSort: false,
//           memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
//           allowSeparatedGroups: false,
//         },
//       ],
//       'import/order': [
//         'error',
//         {
//           groups: [
//             'builtin', // Node.js built-in modules
//             'external', // npm packages
//             'internal', // Absolute imports con alias @
//             'parent', // Imports relativos del padre (..)
//             'sibling', // Imports relativos del mismo nivel (.)
//             'index', // Index del directorio actual
//             'type', // Type imports
//           ],
//           'newlines-between': 'always',
//           alphabetize: {
//             order: 'asc',
//             caseInsensitive: true,
//           },
//           pathGroups: [
//             {
//               pattern: '@domain/**',
//               group: 'internal',
//               position: 'before',
//             },
//             {
//               pattern: '@application/**',
//               group: 'internal',
//               position: 'before',
//             },
//             {
//               pattern: '@infrastructure/**',
//               group: 'internal',
//               position: 'before',
//             },
//             {
//               pattern: '@shared/**',
//               group: 'internal',
//               position: 'before',
//             },
//             {
//               pattern: '@config/**',
//               group: 'internal',
//               position: 'before',
//             },
//           ],
//           pathGroupsExcludedImportTypes: ['builtin'],
//         },
//       ],

//       // ========================================
//       // SonarJS - Calidad de Código
//       // ========================================
//       'sonarjs/cognitive-complexity': ['warn', 15],
//       'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
//       'sonarjs/no-identical-functions': 'warn',
//       'sonarjs/no-redundant-jump': 'error',
//       'sonarjs/prefer-immediate-return': 'warn',
//       'sonarjs/prefer-object-literal': 'warn',
//       'sonarjs/prefer-single-boolean-return': 'warn',

//       // ========================================
//       // Mejores Prácticas Generales
//       // ========================================
//       'no-console': [
//         'warn',
//         {
//           allow: ['warn', 'error', 'info'],
//         },
//       ],
//       'no-debugger': 'error',
//       'no-alert': 'error',
//       'no-var': 'error',
//       'prefer-const': 'error',
//       'prefer-arrow-callback': 'error',
//       'prefer-template': 'warn',
//       'object-shorthand': 'warn',
//       'no-param-reassign': 'warn',
//       // 'no-return-await': 'warn',
//       'require-await': 'warn',
//       'no-throw-literal': 'error',
//       'prefer-promise-reject-errors': 'error',

//       // ========================================
//       // Estilo de Código
//       // ========================================
//       'max-len': [
//         'warn',
//         {
//           code: 100,
//           ignoreUrls: true,
//           ignoreStrings: true,
//           ignoreTemplateLiterals: true,
//           ignoreRegExpLiterals: true,
//         },
//       ],
//       'max-lines': [
//         'warn',
//         {
//           max: 300,
//           skipBlankLines: true,
//           skipComments: true,
//         },
//       ],
//       'max-lines-per-function': [
//         'warn',
//         {
//           max: 50,
//           skipBlankLines: true,
//           skipComments: true,
//         },
//       ],
//       complexity: ['warn', 10],
//       'max-depth': ['warn', 4],
//       'max-nested-callbacks': ['warn', 3],
//       'max-params': ['warn', 4],

//       // ========================================
//       // Comentarios y Documentación
//       // ========================================
//       'spaced-comment': [
//         'warn',
//         'always',
//         {
//           markers: ['/'],
//         },
//       ],
//     },
//     settings: {
//       'import/resolver': {
//         typescript: {
//           alwaysTryTypes: true,
//           project: './tsconfig.json',
//         },
//         node: {
//           extensions: ['.js', '.jsx', '.ts', '.tsx'],
//         },
//       },
//       'import/parsers': {
//         '@typescript-eslint/parser': ['.ts', '.tsx'],
//       },
//     },
//   },

//   // ========================================
//   // Configuración específica para archivos de test
//   // ========================================
//   {
//     files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
//     rules: {
//       '@typescript-eslint/no-explicit-any': 'off',
//       'max-lines-per-function': 'off',
//       'sonarjs/no-duplicate-string': 'off',
//     },
//   },

//   // ========================================
//   // Configuración para archivos de configuración
//   // ========================================
//   {
//     files: ['*.config.js', '*.config.ts', 'eslint.config.js'],
//     rules: {
//       'import/no-default-export': 'off',
//       '@typescript-eslint/no-var-requires': 'off',
//     },
//   },

//   // ========================================
//   // Archivos a ignorar
//   // ========================================
//   {
//     ignores: [
//       'node_modules/',
//       'dist/',
//       'build/',
//       'coverage/',
//       'logs/',
//       'sessions/',
//       '*.min.js',
//       '*.d.ts',
//       '.env',
//       '.env.*',
//     ],
//   },
// ];
