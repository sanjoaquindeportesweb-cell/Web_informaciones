'use client'

import type { ReactNode } from 'react'

import { elevacion, m, transicion, useReducedMotion } from '@/lib/movimiento'

/**
 * Eleva su contenido al pasar por encima o al enfocar algo de dentro.
 *
 * Es un envoltorio y no una prop de cada tarjeta para que las tarjetas sigan
 * siendo componentes de servidor: solo este trozo viaja al navegador.
 *
 * `whileFocus` no serviría —el foco cae en el enlace de dentro, no aquí—, así
 * que la elevación por teclado se activa con `focus-within` desde CSS. Sin eso,
 * quien navega con tabulador no vería ninguna de las dos señales.
 */
export const Elevable = ({
  children,
  className,
  desactivado = false,
}: {
  children: ReactNode
  className?: string
  desactivado?: boolean
}) => {
  const menos = useReducedMotion()

  if (menos || desactivado) return <div className={className}>{children}</div>

  return (
    <m.div
      className={className}
      whileHover={elevacion}
      transition={transicion.rapida}
      /* Solo transform: `y` no provoca recálculo de layout ni afecta a los
         elementos vecinos, al contrario que animar `margin` o `top`. */
    >
      {children}
    </m.div>
  )
}
