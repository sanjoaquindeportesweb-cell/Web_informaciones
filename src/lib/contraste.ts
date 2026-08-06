/**
 * Cálculo de contraste WCAG 2.1 en el navegador.
 *
 * Gemelo de scripts/audit-contrast.mjs, que hace lo mismo en CI leyendo el CSS.
 * Aquí se lee del DOM para que la guía de estilo muestre el ratio **medido**,
 * no uno escrito a mano en un comentario que nadie vuelve a comprobar.
 */

export const aRgb = (hex: string): [number, number, number] => {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

const luminancia = (hex: string): number =>
  aRgb(hex)
    .map((c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i]!, 0)

export const contraste = (frente: string, fondo: string): number => {
  const [l1, l2] = [luminancia(frente), luminancia(fondo)].sort((a, b) => b - a) as [number, number]
  return (l1 + 0.05) / (l2 + 0.05)
}

/**
 * Valor resuelto de una variable CSS, siguiendo cadenas de var(). Un literal
 * `#hex` se devuelve tal cual: blanco no es un token del sistema, pero es la
 * mitad de casi todos los pares que hay que medir sobre el campo violeta.
 */
export const tokenCss = (nombre: string, raiz?: Element): string => {
  if (nombre.startsWith('#')) return nombre
  if (typeof window === 'undefined') return '#000000'
  const el = raiz ?? document.documentElement
  let valor = getComputedStyle(el).getPropertyValue(nombre).trim()
  let saltos = 0
  while (valor.startsWith('var(') && saltos < 10) {
    const ref = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(valor)
    if (!ref?.[1]) break
    valor = getComputedStyle(el).getPropertyValue(ref[1]).trim()
    saltos += 1
  }
  return valor || '#000000'
}

export const contrasteTokens = (frente: string, fondo: string): number =>
  contraste(tokenCss(frente), tokenCss(fondo))

export type Clasificacion = 'AA texto' | 'AA grande' | 'AA interfaz' | 'insuficiente'

/**
 * Clasifica un ratio. Las tres categorías existen porque el sistema las usa:
 * el naranja institucional cae en «AA grande / interfaz» y por eso no puede
 * llevar texto normal encima.
 */
export const clasificar = (ratio: number): Clasificacion => {
  if (ratio >= 4.5) return 'AA texto'
  if (ratio >= 3) return 'AA grande'
  if (ratio >= 1.25) return 'AA interfaz'
  return 'insuficiente'
}
