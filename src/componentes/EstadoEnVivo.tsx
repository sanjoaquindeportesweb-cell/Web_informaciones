'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import { COLOR_ESTADO, estadoDe, type DiaHorario, type Estado } from '@/lib/horarios'
import { IconoReloj } from './Iconos'

/**
 * Estado en vivo de un recinto: «Abierto · cierra 21:00».
 *
 * Se calcula en el cliente por dos razones. En el servidor quedaría congelado
 * por la caché estática —diría «Abierto» a las tres de la mañana— y además el
 * primer render debe coincidir con el del servidor o React tira un error de
 * hidratación. Por eso empieza en null y se llena tras montar.
 *
 * Se refresca cada 30 s para que el paso de «Cierra en 40 min» a «Cerrado»
 * ocurra mientras la persona mira la página, no en la siguiente visita.
 */

export const EstadoEnVivo = ({
  horarios,
  className,
}: {
  horarios: DiaHorario[]
  className?: string
}) => {
  const [estado, setEstado] = useState<Estado | null>(null)

  useEffect(() => {
    const calcular = () => setEstado(estadoDe(horarios))
    calcular()
    const id = setInterval(calcular, 30_000)
    return () => clearInterval(id)
  }, [horarios])

  return (
    <p
      /* «polite» y no «assertive»: el cambio de estado es informativo y no
         debe interrumpir lo que el lector de pantalla esté leyendo. */
      aria-live="polite"
      className={cn(
        'inline-flex min-h-6 items-center gap-2 text-[15px] font-semibold',
        estado ? COLOR_ESTADO[estado.clave] : 'text-muted-foreground',
        className,
      )}
    >
      <IconoReloj aria-hidden="true" />
      {/* Sin estado todavía se reserva la altura, para que no salte el layout. */}
      <span className="tabular">{estado?.etiqueta ?? ' '}</span>
    </p>
  )
}
