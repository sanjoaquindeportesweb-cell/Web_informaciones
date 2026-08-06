import type { ComponentType } from 'react'

import { CATEGORIAS_NOTICIA, CLAVES_CATEGORIA, type ClaveCategoria } from '@/constantes/categorias'
import {
  IconoBalon,
  IconoCalendario,
  IconoCheck,
  IconoInfo,
  IconoMascara,
  IconoPaleta,
  type PropsIcono,
} from './Iconos'

export type { ClaveCategoria }
export { CLAVES_CATEGORIA }

/**
 * Catálogo de categorías, con la parte visual.
 *
 * Las claves y etiquetas vienen de `constantes/categorias.ts` — la fuente
 * única que también usa Payload para el `select` del panel. Aquí se suma lo
 * que solo tiene sentido en el navegador: tinta, tinte e **icono**, y esto
 * último no es decoración: el color nunca puede ir solo. En deuteranopía el
 * naranja, el lima y el carmín colapsan al mismo marrón, así que la tarjeta
 * escribe además el nombre de la categoría. Tinta, icono y palabra: tres
 * señales para el mismo dato.
 *
 * Las clases van escritas completas y no construidas con plantillas, porque
 * Tailwind escanea texto: `text-cat-${slug}` no genera ninguna clase.
 */

export type Categoria = {
  clave: ClaveCategoria
  etiqueta: string
  /** Tinta: texto, icono y filete de 6px. */
  texto: string
  /** Tinte al 10 %: superficie de la ficha. */
  fondo: string
  /** Filete lateral de la tarjeta. */
  filete: string
  Icono: ComponentType<PropsIcono>
}

const ICONOS: Record<ClaveCategoria, ComponentType<PropsIcono>> = {
  deportivo: IconoBalon,
  cultural: IconoMascara,
  artistico: IconoPaleta,
  salud: IconoCheck,
  formativo: IconoInfo,
  comunitario: IconoCalendario,
}

/* Clases escritas completas, una por una: es justo lo que el comentario de
   arriba pide no romper. Un `text-cat-${clave}` aquí compilaría en local
   (Tailwind ve todo el código fuente en dev) pero desaparecería del CSS de
   producción, porque el escaneo de contenido es estático y no ejecuta JS. */
const CLASES: Record<ClaveCategoria, Pick<Categoria, 'texto' | 'fondo' | 'filete'>> = {
  deportivo: { texto: 'text-cat-deportivo', fondo: 'bg-cat-deportivo-suave', filete: 'bg-cat-deportivo' },
  cultural: { texto: 'text-cat-cultural', fondo: 'bg-cat-cultural-suave', filete: 'bg-cat-cultural' },
  artistico: { texto: 'text-cat-artistico', fondo: 'bg-cat-artistico-suave', filete: 'bg-cat-artistico' },
  salud: { texto: 'text-cat-salud', fondo: 'bg-cat-salud-suave', filete: 'bg-cat-salud' },
  formativo: { texto: 'text-cat-formativo', fondo: 'bg-cat-formativo-suave', filete: 'bg-cat-formativo' },
  comunitario: {
    texto: 'text-cat-comunitario',
    fondo: 'bg-cat-comunitario-suave',
    filete: 'bg-cat-comunitario',
  },
}

export const CATEGORIAS: Record<ClaveCategoria, Categoria> = Object.fromEntries(
  CATEGORIAS_NOTICIA.map(({ clave, etiqueta }) => [
    clave,
    { clave, etiqueta, ...CLASES[clave], Icono: ICONOS[clave] },
  ]),
) as Record<ClaveCategoria, Categoria>

/**
 * Resuelve una categoría con respaldo neutro. Un valor desconocido —porque
 * llegó de un documento viejo o de un dato de prueba— no puede dejar la
 * tarjeta sin pintar.
 */
export const categoriaDe = (clave: string | null | undefined): Categoria =>
  CATEGORIAS[clave as ClaveCategoria] ?? {
    clave: 'comunitario',
    etiqueta: 'General',
    texto: 'text-muted-foreground',
    fondo: 'bg-muted',
    filete: 'bg-border',
    Icono: IconoInfo,
  }
