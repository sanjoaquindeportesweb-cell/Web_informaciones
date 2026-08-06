import type { CollectionConfig } from 'payload'

import { esAdmin, estaAutenticado } from '@/payload/acceso'
import { revalidarDestacados, revalidarDestacadosAlBorrar } from '@/payload/revalidacion'

/**
 * Destacados del carrusel de portada.
 *
 * No lleva `versions.drafts`: la vigencia por fechas ya resuelve el mismo
 * problema que resolvería un borrador, y de forma más útil para un banner
 * —«mostrar desde el lunes hasta el viernes» es más simple que programar una
 * publicación y luego una despublicación a mano. `activo` es el apagador de
 * emergencia para sacar algo ya mismo sin tocar las fechas.
 */
export const Destacados: CollectionConfig = {
  slug: 'destacados',
  labels: { singular: 'Destacado', plural: 'Destacados de portada' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'activo', 'vigenciaDesde', 'vigenciaHasta', 'orden'],
    description: 'Hasta cinco piezas para el carrusel de la portada.',
  },
  access: {
    read: () => true,
    create: estaAutenticado,
    update: estaAutenticado,
    delete: esAdmin,
  },
  hooks: {
    afterChange: [revalidarDestacados],
    afterDelete: [revalidarDestacadosAlBorrar],
  },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    { name: 'bajada', type: 'textarea' },
    { name: 'imagen', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'enlace',
      type: 'text',
      required: true,
      admin: { description: 'Ruta interna (/noticias/...) o URL externa completa.' },
    },
    { name: 'textoEnlace', type: 'text', defaultValue: 'Ver más' },
    { name: 'externo', type: 'checkbox', defaultValue: false, label: 'El enlace sale del portal' },
    {
      name: 'orden',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'De menor a mayor. Dos piezas con el mismo número se ordenan por fecha.' },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Apagador rápido: desmarca para sacarlo ya mismo.' },
    },
    {
      name: 'vigenciaDesde',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'vigenciaHasta',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
