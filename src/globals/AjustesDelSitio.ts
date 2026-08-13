import type { GlobalConfig } from 'payload'

import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'

/**
 * Identidad y contacto de la Corporación.
 *
 * Los campos de `redes` son opcionales y en blanco por defecto: solo se
 * muestra el ícono de la red que tenga URL cargada, así que no hace falta un
 * interruptor aparte para «ocultar» una red que aún no existe.
 *
 * Cada campo dice en su descripción dónde aparece, porque este global se
 * reparte entre dos zonas de la página: los datos de contacto van al pie y
 * los íconos de redes a la barra superior. Sin decirlo, buscar «dónde se
 * edita el teléfono» era ir a ciegas entre tres pestañas.
 */
export const AjustesDelSitio: GlobalConfig = {
  slug: 'ajustes-del-sitio',
  label: 'Ajustes del sitio',
  admin: {
    description:
      'Identidad y contacto. Los datos de contacto se ven en el pie de página; los íconos de redes, en la barra superior.',
  },
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
      admin: {
        description:
          'Se ve en el pie de página. Si aún no está confirmada, usa un marcador evidente, nunca una inventada.',
      },
    },
    {
      name: 'telefono',
      type: 'text',
      required: true,
      admin: { description: 'Se ve en el pie de página.' },
    },
    {
      name: 'correo',
      type: 'text',
      required: true,
      admin: {
        description:
          'Se ve en el pie de página. Texto libre y no un campo de correo validado a propósito: mientras no esté confirmado, aquí va un marcador como «[correo por confirmar]», que un campo de tipo email rechazaría por no tener forma de dirección.',
      },
    },
    {
      name: 'redes',
      type: 'group',
      label: 'Redes sociales',
      admin: {
        description:
          'Los íconos se ven en la barra superior, arriba del logo. Solo aparece la red que tenga URL cargada: dejar una en blanco la oculta.',
      },
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook (URL completa)' },
        { name: 'instagram', type: 'text', label: 'Instagram (URL completa)' },
        { name: 'youtube', type: 'text', label: 'YouTube (URL completa)' },
        { name: 'tiktok', type: 'text', label: 'TikTok (URL completa)' },
        { name: 'x', type: 'text', label: 'X / Twitter (URL completa)' },
      ],
    },
  ],
}
