'use client'

import { useEffect } from 'react'

import { cn } from '@/lib/cn'
import { usePreferencia } from '@/lib/cliente'

/**
 * Control de tamaño de texto.
 *
 * El navegador ya trae zoom, pero en la práctica mucha gente mayor no sabe que
 * existe, y en el teléfono está enterrado en un menú. Un control visible en la
 * barra institucional es la diferencia entre poder leer el sitio y no poder.
 *
 * Actúa sobre el tamaño de raíz y todo el sistema está en `rem`, así que
 * escala el sitio entero de forma proporcional: no hay que tocar cada
 * componente.
 */

const PASOS = [100, 112.5, 125] as const
const CLAVE = 'sj-tamano-texto'

export const ControlTexto = () => {
  const [guardado, guardar] = usePreferencia(CLAVE, 0)
  const paso = Math.min(Math.max(Math.trunc(guardado), 0), PASOS.length - 1)

  /* Este efecto sí es lo que un efecto debe ser: sincroniza un sistema externo
     —el elemento <html>— con el estado de React. */
  useEffect(() => {
    document.documentElement.style.fontSize = `${PASOS[paso]}%`
  }, [paso])

  return (
    <div className="flex items-center gap-1">
      <span className="sr-only" aria-live="polite">
        Tamaño de texto: {PASOS[paso]} por ciento
      </span>
      <Boton
        etiqueta="Reducir el tamaño del texto"
        onClick={() => guardar(Math.max(0, paso - 1))}
        deshabilitado={paso === 0}
      >
        A<span className="text-[0.9em]">−</span>
      </Boton>
      <Boton
        etiqueta="Aumentar el tamaño del texto"
        onClick={() => guardar(Math.min(PASOS.length - 1, paso + 1))}
        deshabilitado={paso === PASOS.length - 1}
      >
        A<span className="text-[0.9em]">+</span>
      </Boton>
    </div>
  )
}

const Boton = ({
  etiqueta,
  onClick,
  deshabilitado,
  children,
}: {
  etiqueta: string
  onClick: () => void
  deshabilitado: boolean
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={deshabilitado}
    aria-label={etiqueta}
    className={cn(
      'grid h-8 min-w-8 cursor-pointer place-items-center rounded px-1.5 font-semibold',
      'transition-colors duration-[var(--duracion-rapida)]',
      'hover:bg-white/15 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent',
    )}
  >
    {children}
  </button>
)
