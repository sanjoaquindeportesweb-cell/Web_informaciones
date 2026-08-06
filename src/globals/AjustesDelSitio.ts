import type { GlobalConfig } from 'payload'

import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'

/**
 * Identidad y contacto de la Corporación.
 *
 * Los cuatro campos de `redes` son opcionales y en blanco por defecto: el
 * pie de página solo muestra el ícono de la red que tenga URL cargada, así
 * que no hace falta un interruptor aparte para «ocultar» una red que aún no
 * existe.
 */
export const AjustesDelSitio: GlobalConfig = {
  slug: 'ajustes-del-sitio',
  label: 'Ajustes del sitio',
  access: {
    read: () => true,
    update: estaAutenticado,
  },
  hooks: {
    afterChange: [revalidarSitio],
  },
  fields: [
    {
      name: 'nombreCorporacion',
      type: 'text',
      required: true,
      defaultValue: 'Corporación Municipal de Deportes de San Joaquín',
    },
    {
      name: 'direccion',
      type: 'text',
      required: true,
      admin: { description: 'Si aún no está confirmada, usa un marcador evidente, nunca una inventada.' },
    },
    { name: 'telefono', type: 'text', required: true },
    {
      name: 'correo',
      type: 'text',
      required: true,
      admin: {
        description:
          'Texto libre y no un campo de correo validado a propósito: mientras no esté confirmado, aquí va un marcador como «[correo por confirmar]», que un campo de tipo email rechazaría por no tener forma de dirección.',
      },
    },
    {
      name: 'redes',
      type: 'group',
      label: 'Redes sociales',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook (URL completa)' },
        { name: 'instagram', type: 'text', label: 'Instagram (URL completa)' },
        { name: 'youtube', type: 'text', label: 'YouTube (URL completa)' },
        { name: 'x', type: 'text', label: 'X / Twitter (URL completa)' },
      ],
    },
  ],
}
