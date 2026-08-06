/**
 * Formateo de fechas. Todo el sitio pasa por aquí.
 *
 * Está centralizado por una razón concreta: `Intl` toma por defecto la zona
 * horaria del dispositivo, y un servidor renderizando en UTC publica una
 * noticia del día 5 como si fuera del 4. Fijar la zona en un solo archivo hace
 * imposible ese error.
 */

export const ZONA = 'America/Santiago'
const LOCAL = 'es-CL'

const formateador = (opciones: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCAL, { timeZone: ZONA, ...opciones })

const aFecha = (valor: Date | string | number): Date =>
  valor instanceof Date ? valor : new Date(valor)

/** 5 ago 2026 */
export const fechaCorta = (valor: Date | string | number): string =>
  formateador({ day: 'numeric', month: 'short', year: 'numeric' }).format(aFecha(valor))

/** 5 de agosto de 2026 */
export const fechaLarga = (valor: Date | string | number): string =>
  formateador({ day: 'numeric', month: 'long', year: 'numeric' }).format(aFecha(valor))

/** martes 5 de agosto */
export const diaLargo = (valor: Date | string | number): string =>
  formateador({ weekday: 'long', day: 'numeric', month: 'long' }).format(aFecha(valor))

/** 21:00 */
export const hora = (valor: Date | string | number): string =>
  formateador({ hour: '2-digit', minute: '2-digit', hour12: false }).format(aFecha(valor))

/** 5 ago 2026, 21:00 */
export const fechaHora = (valor: Date | string | number): string =>
  formateador({
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(aFecha(valor))

/** Formato ISO para el atributo `dateTime` de <time>. */
export const iso = (valor: Date | string | number): string => aFecha(valor).toISOString()
