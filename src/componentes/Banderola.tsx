import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * La banderola: tres bandas a 30° sobre el campo violeta.
 *
 * Es la firma de la institución y el sistema de composición del sitio, no un
 * adorno. Ese mismo ángulo gobierna el corte del hero, las máscaras de las
 * fotos destacadas y los cierres de sección; en todo el portal existe un solo
 * ángulo y es este.
 *
 * Regla del sistema: **una banderola de campo por página**. Si aparece dos
 * veces deja de ser una firma y pasa a ser papel de regalo.
 */

type PropsCampo = {
  children?: ReactNode
  /** Grosor perpendicular de cada banda. El original mide 104px. */
  grosor?: number
  className?: string
}

export const Banderola = ({ children, grosor = 104, className }: PropsCampo) => (
  <div
    className={cn('banderola relative isolate overflow-hidden', className)}
    style={{ ['--bnd' as string]: `${grosor}px` }}
  >
    {children}
  </div>
)

/**
 * Tira fina de cierre de sección: las tres bandas sin campo violeta.
 * Decorativa por completo, así que va fuera del árbol de accesibilidad.
 */
export const FiloBanderola = ({ className }: { className?: string }) => (
  <div className={cn('banderola-filo h-1.5 w-full', className)} aria-hidden="true" />
)

/**
 * Fondo por capas del hero, detrás del contenido.
 *
 * Las manchas se animan solo con `transform` y `opacity`: animar `width` o
 * `top` en un elemento de este tamaño y con `blur(70px)` encima tira los
 * fotogramas en el teléfono de gama media con el que se visita este sitio.
 */
export const FondoHero = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div className="bg-violeta absolute inset-0" />
    <div
      className="mancha bg-marca-morado top-[-15%] left-[5%] h-72 w-72 opacity-25"
      style={{ animationDelay: '0s' }}
    />
    <div
      className="mancha bg-marca-naranja right-[8%] bottom-[-20%] h-80 w-80 opacity-[0.18]"
      style={{ animationDelay: '-11s' }}
    />
  </div>
)
