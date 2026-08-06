import type { Access, FieldAccess } from 'payload'

/**
 * Control de acceso del panel.
 *
 * El portal tiene dos roles, no el RBAC completo de la plataforma de
 * trámites: es un CMS autónomo con un puñado de personas de comunicaciones,
 * no un sistema con colas de aprobación por módulo. `admin` gestiona todo,
 * incluidas las cuentas; `editor` gestiona contenido pero no puede borrar
 * ni tocar usuarios — así un error de alguien nuevo no puede dejar el sitio
 * sin contenido.
 */

export const esAdmin: Access = ({ req }) => req.user?.rol === 'admin'

/* Mismo chequeo, para el control de acceso a nivel de campo: la firma de
   `FieldAccess` no es intercambiable con la de `Access` aunque el cuerpo sea
   idéntico — TypeScript los trata como tipos distintos. */
export const esAdminCampo: FieldAccess = ({ req }) => req.user?.rol === 'admin'

export const estaAutenticado: Access = ({ req }) => Boolean(req.user)

/**
 * Lectura pública de contenido con borradores: solo lo publicado es visible
 * sin sesión. Con sesión (para previsualizar desde el panel) se ve todo,
 * publicado o no. La condición `_status` es la que añade `versions.drafts`.
 */
export const publicoSiPublicado: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
