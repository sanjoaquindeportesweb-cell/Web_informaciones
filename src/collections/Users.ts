import type { CollectionConfig } from 'payload'

import { esAdmin, esAdminCampo, estaAutenticado } from '@/payload/acceso'

/**
 * Personas que editan el portal.
 *
 * Dos roles y nada más — este es un CMS autónomo para un equipo pequeño de
 * comunicaciones, no el RBAC de catorce módulos de la plataforma de
 * trámites. `admin` gestiona cuentas y puede borrar; `editor` crea y publica
 * contenido pero no toca usuarios ni borra nada, para que un error de quien
 * recién llega no pueda dejar el sitio sin contenido.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'nombre', 'rol'],
    description: 'Cuentas del personal de la Corporación que edita el portal.',
  },
  auth: true,
  access: {
    read: estaAutenticado,
    create: esAdmin,
    update: ({ req, id }) => Boolean(req.user?.rol === 'admin' || req.user?.id === id),
    delete: esAdmin,
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'rol',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrador — gestiona cuentas y contenido', value: 'admin' },
        { label: 'Editor — gestiona contenido', value: 'editor' },
      ],
      access: {
        /* Solo un administrador puede ascender a alguien a administrador;
           si no, cualquier editor podría autoasignarse el rol. */
        update: esAdminCampo,
      },
    },
  ],
}
