import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'

/**
 * Configuración de ESLint.
 *
 * La plantilla de Payload envolvía estos configs en `FlatCompat`, pero en
 * eslint-config-next 16 ya son configuraciones planas: pasarlas por el puente
 * de compatibilidad hacía reventar a ESLint con «Converting circular structure
 * to JSON» antes de analizar una sola línea. Se importan directamente.
 *
 * Añadido sobre la plantilla: `jsx-a11y` en modo recomendado, y la prohibición
 * de hex literales fuera de la guía de estilo y del logotipo. Los colores solo
 * pueden venir de los tokens; el día que alguien pegue un `#ff0000` en un
 * componente, la auditoría de contraste no se entera pero el lint sí.
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      /* Solo las reglas, no el plugin: eslint-config-next ya registra
         `jsx-a11y`, y volver a declararlo aborta ESLint con «Cannot redefine
         plugin». Lo que se gana aquí es el conjunto recomendado completo, que
         es más amplio que el subconjunto que trae Next. */
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message:
            'Nada de colores literales: usa un token del sistema (globals.css). Si de verdad hace falta, declara la excepción en eslint.config.mjs.',
        },
      ],
    },
  },

  {
    /* Excepciones justificadas: la guía muestra los hex a propósito, el
       logotipo no es un token del sistema —no cambia con el tema— y el
       generador de imágenes de muestra no es código de interfaz. */
    files: [
      'src/app/(frontend)/guia-de-estilo/**',
      'src/componentes/SelloCorporacion.tsx',
      'src/lib/contraste.ts',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },

  {
    ignores: [
      '.next/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default config
