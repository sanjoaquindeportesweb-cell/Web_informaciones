/**
 * Formateo de números y texto. Mismo criterio que fecha.ts: un solo lugar.
 */

const LOCAL = 'es-CL'

/** 3.515 — separador de miles chileno, que es punto y no coma. */
export const entero = (valor: number): string =>
  new Intl.NumberFormat(LOCAL, { maximumFractionDigits: 0 }).format(valor)

export const decimal = (valor: number, decimales = 1): string =>
  new Intl.NumberFormat(LOCAL, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor)

/** $12.000 — sin decimales, porque el peso chileno no los usa en la práctica. */
export const clp = (valor: number): string =>
  new Intl.NumberFormat(LOCAL, {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor)

/**
 * Convierte un título en slug. Descompone los acentos con NFD y borra el rango
 * de diacríticos combinantes, en vez de mapear letra por letra: así «Natación»
 * y «Educación Física» salen bien sin tabla de excepciones.
 */
export const slug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Corta sin partir palabras y sin dejar el puntito pegado a una coma. */
export const recortar = (texto: string, largo = 160): string => {
  if (texto.length <= largo) return texto
  const corte = texto.slice(0, largo)
  const ultimo = corte.lastIndexOf(' ')
  return `${corte.slice(0, ultimo > 0 ? ultimo : largo).replace(/[.,;:]$/, '')}…`
}
