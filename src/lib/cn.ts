/**
 * Une clases condicionales. Sin dependencias a propósito: el proyecto no lleva
 * librerías de componentes y esto es lo único que se necesitaba de clsx.
 */
export type ValorClase = string | number | false | null | undefined

export const cn = (...valores: ValorClase[]): string =>
  valores.filter((v): v is string | number => Boolean(v)).join(' ')
