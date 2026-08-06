import type { CollectionConfig, Validate } from 'payload'

import { camposSEO, campoSlug } from '@/payload/campos'
import { esAdmin, estaAutenticado, publicoSiPublicado } from '@/payload/acceso'
import { revalidarRecintos, revalidarRecintosAlBorrar } from '@/payload/revalidacion'

/* Mismo patrón HH:MM que `aMinutos()` en `lib/horarios.ts`: si un horario no
   cumple esta forma, el cálculo del estado en vivo simplemente lo ignora sin
   avisar. Validarlo aquí es la diferencia entre «la piscina nunca aparece
   abierta» y enterarse al guardar por qué. */
const validarHora: Validate<string | null | undefined> = (valor) => {
  if (!valor) return 'La hora es obligatoria.'
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor) || 'Usa el formato 24 horas HH:MM, por ejemplo 08:00.'
}

const NOMBRES_DIA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const

/**
 * Recintos deportivos.
 *
 * `horarios` es un array por día de la semana (0 domingo … 6 sábado, igual
 * que `Date.getDay()`) con sus tramos horarios. `EstadoEnVivo` en el
 * frontend lee exactamente esta forma para calcular «Abierto · cierra
 * 21:00» — cambiar la forma de este campo sin tocar `lib/horarios.ts` deja
 * el estado en vivo roto en silencio.
 */
export const Recintos: CollectionConfig = {
  slug: 'recintos',
  labels: { singular: 'Recinto deportivo', plural: 'Recintos deportivos' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'direccion', '_status'],
    description: 'Estadio, gimnasio, piscinas y demás recintos que administra la Corporación.',
  },
  access: {
    read: publicoSiPublicado,
    create: estaAutenticado,
    update: estaAutenticado,
    delete: esAdmin,
  },
  versions: {
    drafts: { schedulePublish: true },
  },
  hooks: {
    afterChange: [revalidarRecintos],
    afterDelete: [revalidarRecintosAlBorrar],
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    campoSlug('nombre'),
    {
      name: 'direccion',
      type: 'text',
      required: true,
      admin: {
        description:
          'Si aún no está confirmada, escribe un marcador como «[dirección por confirmar]»: nunca una dirección inventada.',
      },
    },
    {
      name: 'disciplinas',
      type: 'text',
      hasMany: true,
      admin: { description: 'Una por una. Ej: Fútbol, luego Atletismo.' },
    },
    { name: 'aforo', type: 'number', min: 0, admin: { description: 'Cantidad de personas.' } },
    { name: 'portada', type: 'upload', relationTo: 'media' },
    {
      name: 'urlReserva',
      type: 'text',
      label: 'Enlace de reserva',
      admin: {
        description: 'URL de la plataforma de trámites para arrendar este recinto. Déjalo vacío si no se arrienda.',
      },
    },
    {
      name: 'horarios',
      type: 'array',
      label: 'Horario de atención',
      labels: { singular: 'Día', plural: 'Días' },
      admin: {
        description: 'Un ítem por cada día con horario distinto. Los días sin ítem se muestran cerrados.',
      },
      fields: [
        {
          name: 'dia',
          type: 'select',
          required: true,
          options: NOMBRES_DIA.map((label, value) => ({ label, value: String(value) })),
        },
        {
          name: 'tramos',
          type: 'array',
          required: true,
          minRows: 1,
          labels: { singular: 'Tramo', plural: 'Tramos' },
          admin: {
            description: 'Casi siempre un solo tramo. Dos si el recinto cierra al mediodía.',
          },
          fields: [
            { name: 'inicio', type: 'text', required: true, validate: validarHora },
            { name: 'fin', type: 'text', required: true, validate: validarHora },
          ],
        },
      ],
    },
    camposSEO(),
  ],
}
