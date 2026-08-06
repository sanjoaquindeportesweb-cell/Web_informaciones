/**
 * Estado en vivo de un recinto deportivo.
 *
 * El horario es dato editable desde el panel; aquí solo se interpreta. Dos
 * decisiones que importan:
 *
 * 1. Se resuelve siempre en America/Santiago, no en la zona del dispositivo.
 *    Un vecino que viaja no debe ver «Cerrado» porque su teléfono está en otro
 *    huso, y el servidor renderizando en UTC tampoco debe adelantar el cierre.
 *
 * 2. Se calcula en el cliente. En el servidor quedaría congelado por la caché
 *    estática y diría «Abierto» a las tres de la mañana.
 */

import { ZONA } from './fecha'

export type Tramo = {
  /** 'HH:MM' en hora de Santiago. */
  inicio: string
  fin: string
}

export type DiaHorario = {
  /** 0 = domingo, 6 = sábado, igual que Date.getDay(). */
  dia: number
  tramos: Tramo[]
}

export type ClaveEstado = 'abierto' | 'por-cerrar' | 'cerrado'

export type Estado = {
  clave: ClaveEstado
  /** Texto listo para pintar: «Abierto · cierra 21:00». */
  etiqueta: string
}

export const NOMBRES_DIA = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const

const INDICE_DIA: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/** Minutos desde medianoche, o null si el texto no es 'HH:MM'. */
const aMinutos = (hhmm: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  const horas = Number(m[1])
  const minutos = Number(m[2])
  if (horas > 23 || minutos > 59) return null
  return horas * 60 + minutos
}

const aTexto = (minutos: number): string => {
  const h = Math.floor(minutos / 60) % 24
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Día de la semana y minutos transcurridos, en hora de Santiago. */
export const ahoraEnSantiago = (referencia: Date = new Date()): { dia: number; minutos: number } => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(referencia)

  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? ''

  return {
    dia: INDICE_DIA[valor('weekday')] ?? 0,
    /* Algunos motores devuelven '24' para la medianoche; el módulo lo corrige. */
    minutos: (Number(valor('hour')) % 24) * 60 + Number(valor('minute')),
  }
}

/**
 * Devuelve el estado actual. `umbral` son los minutos antes del cierre a partir
 * de los cuales conviene avisar: llegar a una piscina que cierra en diez
 * minutos es peor que encontrarla cerrada.
 */
export const estadoDe = (
  horarios: DiaHorario[],
  referencia: Date = new Date(),
  umbral = 60,
): Estado => {
  if (horarios.length === 0) return { clave: 'cerrado', etiqueta: 'Sin horario publicado' }

  const { dia, minutos } = ahoraEnSantiago(referencia)
  const deDia = (d: number) => horarios.find((h) => h.dia === d)?.tramos ?? []

  /* ¿Hay un tramo en curso? */
  for (const tramo of deDia(dia)) {
    const inicio = aMinutos(tramo.inicio)
    const fin = aMinutos(tramo.fin)
    if (inicio === null || fin === null || fin <= inicio) continue

    if (minutos >= inicio && minutos < fin) {
      const restan = fin - minutos
      if (restan <= umbral) {
        return { clave: 'por-cerrar', etiqueta: `Cierra en ${restan} min` }
      }
      return { clave: 'abierto', etiqueta: `Abierto · cierra ${aTexto(fin)}` }
    }
  }

  /* ¿Abre más tarde hoy? */
  const siguienteHoy = deDia(dia)
    .map((t) => aMinutos(t.inicio))
    .filter((v): v is number => v !== null && v > minutos)
    .sort((a, b) => a - b)[0]

  if (siguienteHoy !== undefined) {
    return { clave: 'cerrado', etiqueta: `Cerrado · abre hoy ${aTexto(siguienteHoy)}` }
  }

  /* Si no, el próximo día con algún tramo. */
  for (let salto = 1; salto <= 7; salto += 1) {
    const proximo = (dia + salto) % 7
    const apertura = deDia(proximo)
      .map((t) => aMinutos(t.inicio))
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b)[0]

    if (apertura !== undefined) {
      const cuando = salto === 1 ? 'mañana' : NOMBRES_DIA[proximo]
      return { clave: 'cerrado', etiqueta: `Cerrado · abre ${cuando} ${aTexto(apertura)}` }
    }
  }

  return { clave: 'cerrado', etiqueta: 'Cerrado' }
}

/** Token de color que corresponde a cada estado. */
export const COLOR_ESTADO: Record<ClaveEstado, string> = {
  abierto: 'text-exito',
  'por-cerrar': 'text-aviso',
  cerrado: 'text-muted-foreground',
}
