import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { esAdmin, estaAutenticado } from '@/payload/acceso'

/**
 * Bandeja del formulario de contacto.
 *
 * `create` es público a propósito: lo llena el formulario del sitio, sin
 * sesión. El anti-spam (honeypot y límite por IP) vive en el servidor de
 * Next, no aquí — Payload no es un limitador de tasa. Lo que sí hace este
 * archivo es no confiar en lo que mande el cliente para nada que decida
 * seguridad o estado: `leido` se fuerza a `false` y la IP se toma de la
 * petición, nunca del cuerpo, para que un envío no pueda llegar
 * automarcado como leído ni con una IP falsa.
 */
const forzarCamposDeServidor: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation !== 'create') return data
  /* `PayloadRequest` es un `Request` de la Fetch API, no el `req` de Node: no
     trae `.ip`. Detrás de un proxy (Amplify, cualquier balanceador) la IP
     real llega en la cabecera, nunca en el objeto de conexión TCP. */
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  return { ...data, leido: false, ip }
}

export const MensajesContacto: CollectionConfig = {
  slug: 'mensajes-contacto',
  labels: { singular: 'Mensaje', plural: 'Mensajes de contacto' },
  admin: {
    useAsTitle: 'asunto',
    defaultColumns: ['asunto', 'nombre', 'correo', 'leido', 'createdAt'],
    description: 'Mensajes enviados desde el formulario de contacto del portal.',
    /* No hay nada que redactar aquí: es una bandeja, no contenido editorial. */
    hidden: false,
  },
  access: {
    read: estaAutenticado,
    create: () => true,
    update: estaAutenticado,
    delete: esAdmin,
  },
  hooks: {
    beforeChange: [forzarCamposDeServidor],
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    { name: 'correo', type: 'email', required: true },
    { name: 'telefono', type: 'text' },
    { name: 'asunto', type: 'text', required: true },
    { name: 'mensaje', type: 'textarea', required: true },
    {
      name: 'leido',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'ip',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'Registrada al enviar, de solo lectura.' },
    },
  ],
}
