import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

/**
 * Bloques del constructor de páginas.
 *
 * El `slug` de cada bloque coincide letra por letra con el `tipo` del union
 * `Bloque` en `src/bloques/Bloques.tsx`. No es casualidad: mapear un documento
 * de Payload a lo que ese componente espera es tan simple como
 * `tipo: bloque.blockType`. Si algún día un slug de aquí y el `tipo` de allá
 * divergen, el bloque deja de reconocerse y no truena — pero se renderiza
 * vacío, así que conviene no tocar un nombre sin tocar el otro.
 *
 * ── Cómo se agrega un bloque nuevo ──────────────────────────────────────────
 *
 * La lista está pensada para crecer: sumar un tipo son tres archivos y ninguno
 * de ellos obliga a tocar las páginas ya creadas.
 *
 *   1. Acá: un `Block` con su `slug`, sus `labels` en español, su
 *      `interfaceName` y sus campos. Después, sumarlo a `BLOQUES_PAGINA`.
 *   2. `src/bloques/Bloques.tsx`: la variante en el union `Bloque` y el `case`
 *      que la pinta.
 *   3. `src/payload/consultas.ts`, en `aBloque()`: el `case` que traduce el
 *      documento de Payload a esa variante.
 *
 * Los tres son obligatorios y el orden importa poco, pero saltarse el tercero
 * es el error que no avisa: `aBloque()` devuelve `null` para un `blockType` que
 * no reconoce, así que el bloque se guarda bien en el panel, se ve en la vista
 * previa del editor y no aparece en la página publicada.
 *
 * Al terminar, `pnpm generate:types` y `pnpm generate:importmap` — el segundo
 * solo si el bloque lleva un campo `richText`, que arrastra componentes del
 * editor al panel.
 *
 * Lo que esto NO es: autoservicio desde el panel. Un tipo de bloque nuevo pasa
 * por código y por un despliegue. Combinar los que ya existen para armar
 * páginas nuevas, en cambio, no necesita a nadie técnico.
 */

const BloqueTexto: Block = {
  slug: 'texto',
  labels: { singular: 'Texto', plural: 'Bloques de texto' },
  interfaceName: 'BloqueTexto',
  fields: [
    {
      name: 'contenido',
      type: 'richText',
      required: true,
      /* Explícito por la misma razón que en Noticias.cuerpo: el generador del
         importMap no hereda el editor por defecto del config raíz. */
      editor: lexicalEditor(),
    },
  ],
}

const BloqueImagen: Block = {
  slug: 'imagen',
  labels: { singular: 'Imagen', plural: 'Bloques de imagen' },
  interfaceName: 'BloqueImagen',
  fields: [
    { name: 'imagen', type: 'upload', relationTo: 'media', required: true },
    { name: 'pie', type: 'text', label: 'Pie de foto' },
  ],
}

const BloqueGaleria: Block = {
  slug: 'galeria',
  labels: { singular: 'Galería', plural: 'Bloques de galería' },
  interfaceName: 'BloqueGaleria',
  fields: [
    { name: 'titulo', type: 'text' },
    {
      name: 'imagenes',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      minRows: 1,
      required: true,
    },
  ],
}

const BloqueCita: Block = {
  slug: 'cita',
  labels: { singular: 'Cita', plural: 'Bloques de cita' },
  interfaceName: 'BloqueCita',
  fields: [
    { name: 'texto', type: 'textarea', required: true },
    { name: 'autor', type: 'text' },
    { name: 'cargo', type: 'text', admin: { description: 'Ej: Dirección de la Corporación.' } },
  ],
}

const BloquePreguntas: Block = {
  slug: 'preguntas',
  labels: { singular: 'Preguntas frecuentes', plural: 'Bloques de preguntas frecuentes' },
  interfaceName: 'BloquePreguntas',
  fields: [
    { name: 'titulo', type: 'text', defaultValue: 'Preguntas frecuentes' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Pregunta', plural: 'Preguntas' },
      fields: [
        { name: 'pregunta', type: 'text', required: true },
        { name: 'respuesta', type: 'textarea', required: true },
      ],
    },
  ],
}

const BloqueHorarios: Block = {
  slug: 'horarios',
  labels: { singular: 'Tabla de horarios', plural: 'Bloques de horarios' },
  interfaceName: 'BloqueHorarios',
  fields: [
    { name: 'titulo', type: 'text', defaultValue: 'Horario de atención' },
    {
      name: 'filas',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Fila', plural: 'Filas' },
      fields: [
        { name: 'dia', type: 'text', required: true, admin: { description: 'Ej: Lunes a viernes.' } },
        { name: 'horario', type: 'text', required: true, admin: { description: 'Ej: 08:30 – 17:30.' } },
      ],
    },
  ],
}

const BloqueLlamada: Block = {
  slug: 'llamada',
  labels: { singular: 'Llamada a la acción', plural: 'Bloques de llamada a la acción' },
  interfaceName: 'BloqueLlamada',
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'texto', type: 'textarea' },
    {
      name: 'enlace',
      type: 'text',
      required: true,
      admin: { description: 'Ruta interna (/talleres) o URL externa completa.' },
    },
    { name: 'textoEnlace', type: 'text', required: true, defaultValue: 'Ver más' },
    {
      name: 'externo',
      type: 'checkbox',
      defaultValue: false,
      label: 'El enlace sale del portal',
    },
  ],
}

const BloqueVideo: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Bloques de video' },
  interfaceName: 'BloqueVideo',
  fields: [
    {
      name: 'video',
      type: 'relationship',
      relationTo: 'videos',
      required: true,
      admin: {
        description: 'Elige un video del catálogo. Si el que buscas no existe, créalo primero en Videos.',
      },
    },
  ],
}

const BloqueFormulario: Block = {
  slug: 'formulario',
  labels: { singular: 'Formulario', plural: 'Bloques de formulario' },
  interfaceName: 'BloqueFormulario',
  fields: [
    {
      name: 'formulario',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description:
          'Elige un formulario creado en «Formularios». Si el que buscas no existe, créalo primero ahí.',
      },
    },
  ],
}

const BloqueSeparador: Block = {
  slug: 'separador',
  labels: { singular: 'Separador (banderola)', plural: 'Separadores' },
  interfaceName: 'BloqueSeparador',
  fields: [],
}

export const BLOQUES_PAGINA: Block[] = [
  BloqueTexto,
  BloqueImagen,
  BloqueGaleria,
  BloqueCita,
  BloquePreguntas,
  BloqueHorarios,
  BloqueLlamada,
  BloqueVideo,
  BloqueFormulario,
  BloqueSeparador,
]
