'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Acción de servidor del formulario de contacto.
 *
 * El honeypot ya lo filtra `FormularioContacto` en el cliente (responde
 * éxito sin enviar nada), así que lo que llega aquí ya pasó ese primer
 * filtro. Lo que se resuelve en el servidor es lo que un cliente nunca
 * debería poder saltarse: el límite de envíos por IP.
 *
 * El límite vive en memoria del proceso a propósito — no hay Redis en este
 * proyecto y no hace falta: el portal corre en un único servidor Node, así
 * que un `Map` alcanza. Se pierde al reiniciar el proceso, que es aceptable
 * para frenar un script simple, no para defenderse de un ataque distribuido.
 */

const VENTANA_MS = 10 * 60 * 1000
const MAX_ENVIOS_POR_VENTANA = 5

const envios = new Map<string, number[]>()

const dentroDelLimite = (ip: string): boolean => {
  const ahora = Date.now()
  const historial = (envios.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS)

  if (historial.length >= MAX_ENVIOS_POR_VENTANA) {
    envios.set(ip, historial)
    return false
  }

  historial.push(ahora)
  envios.set(ip, historial)
  return true
}

export type CamposContacto = {
  nombre: string
  correo: string
  telefono: string
  asunto: string
  mensaje: string
}

export const enviarMensajeDeContacto = async (datos: CamposContacto): Promise<void> => {
  const cabeceras = await headers()
  const ip = cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida'

  if (!dentroDelLimite(ip)) {
    throw new Error('Se enviaron demasiados mensajes seguidos. Espera unos minutos e inténtalo de nuevo.')
  }

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'mensajes-contacto',
    data: {
      nombre: datos.nombre,
      correo: datos.correo,
      telefono: datos.telefono || undefined,
      asunto: datos.asunto,
      mensaje: datos.mensaje,
    },
  })
}
