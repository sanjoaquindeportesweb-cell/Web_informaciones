import 'server-only'

import { headers } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Autoriza la vista previa en vivo.
 *
 * El panel de Payload abre la página real dentro de un iframe agregando
 * `?vistaPrevia=1` a la URL — eso es lo que le dice a la ruta que pida el
 * borrador en vez de solo lo publicado. Pero ese parámetro es de la URL, así
 * que cualquiera podría escribirlo a mano. La única vez que hay que
 * confiar en él es cuando la cookie de sesión de Payload que llega con la
 * petición pertenece a alguien con cuenta — se verifica con la Local API,
 * no asumiendo que el parámetro alcanza.
 *
 * Sin esta verificación, `?vistaPrevia=1` sería una forma de leer contenido
 * sin publicar sin haber iniciado sesión.
 */
export const vistaPreviaAutorizada = async (): Promise<boolean> => {
  const payload = await getPayload({ config })
  const cabeceras = await headers()
  const { user } = await payload.auth({ headers: cabeceras })
  return Boolean(user)
}

/**
 * Atajo para las rutas: solo verifica la sesión cuando la URL de verdad
 * pide vista previa. Así una visita pública normal no gasta una consulta de
 * autenticación de más en cada carga.
 */
export const resolverVistaPrevia = async (
  searchParams: Record<string, string | string[] | undefined>,
): Promise<boolean> => {
  if (searchParams.vistaPrevia !== '1') return false
  return vistaPreviaAutorizada()
}
