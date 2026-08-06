'use client'

import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'

import { cn } from '@/lib/cn'
import { IconoBuscar } from './Iconos'

/**
 * Buscador de la cabecera.
 *
 * Es un `<form>` de verdad y navega a /buscar: así funciona con Enter, se
 * puede compartir el enlace del resultado y el botón «atrás» del navegador
 * hace lo que se espera. Un buscador que filtra en memoria sin cambiar la URL
 * rompe las tres cosas.
 */

export const Buscador = ({
  className,
  sobreVioleta = false,
}: {
  className?: string
  sobreVioleta?: boolean
}) => {
  const id = useId()
  const router = useRouter()
  const [texto, setTexto] = useState('')

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const q = texto.trim()
        if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`)
      }}
      className={cn('relative', className)}
    >
      {/* La etiqueta existe siempre; sobre la cabecera va oculta a la vista
          pero disponible para el lector de pantalla. Un icono de lupa no es
          una etiqueta. */}
      <label htmlFor={id} className="sr-only">
        Buscar en el portal
      </label>

      <input
        id={id}
        type="search"
        name="q"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar noticias, recintos…"
        className={cn(
          'min-h-11 w-full rounded-full border py-2 pr-4 pl-11 text-base',
          'transition-colors duration-[var(--duracion-rapida)]',
          sobreVioleta
            ? 'border-white/25 bg-white/10 text-white placeholder:text-white/60 focus:bg-white/15'
            : 'border-input bg-card text-foreground placeholder:text-muted-foreground',
        )}
      />

      <button
        type="submit"
        aria-label="Buscar"
        className={cn(
          'toque absolute top-1/2 left-0 grid -translate-y-1/2 cursor-pointer place-items-center rounded-full',
          sobreVioleta ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-primary',
        )}
      >
        <IconoBuscar />
      </button>
    </form>
  )
}
