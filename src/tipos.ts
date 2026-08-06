import type { ClaveCategoria } from '@/componentes/categorias'
import type { DiaHorario } from '@/lib/horarios'

/**
 * Tipos de presentación.
 *
 * Están separados de los que genera Payload a propósito: los componentes
 * reciben exactamente lo que pintan, no el documento entero con sus campos de
 * borrador, versiones y metadatos. Cuando el modelo de contenido cambie, se
 * ajusta el mapeo en un solo sitio y las tarjetas no se enteran.
 */

export type Imagen = {
  url: string
  /** Obligatorio, sin excepción: una imagen sin alt es una imagen que no existe
   *  para quien usa lector de pantalla. */
  alt: string
  ancho?: number
  alto?: number
  desenfoque?: string
}

export type Noticia = {
  slug: string
  titulo: string
  bajada?: string
  categoria: ClaveCategoria | string
  publicadaEn: string
  portada?: Imagen
}

export type Recinto = {
  slug: string
  nombre: string
  direccion: string
  disciplinas: string[]
  aforo?: number
  horarios: DiaHorario[]
  portada?: Imagen
  /** Enlace de salida a la plataforma de arriendo. */
  urlReserva?: string
}

export type Destacado = {
  id: string
  titulo: string
  bajada?: string
  imagen: Imagen
  enlace: string
  externo?: boolean
  textoEnlace?: string
}

export type ItemNavegacion = {
  etiqueta: string
  href: string
  externo?: boolean
  hijos?: ItemNavegacion[]
}
