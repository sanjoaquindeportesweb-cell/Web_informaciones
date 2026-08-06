import Link from 'next/link'
import type { ComponentType } from 'react'

import { cn } from '@/lib/cn'
import { Elevable } from './Elevable'
import { IconoEnlaceExterno, IconoFlecha, type PropsIcono } from './Iconos'

/**
 * Acceso rápido de portada.
 *
 * Los que salen a la plataforma de trámites llevan icono de enlace externo y
 * lo dicen en el nombre accesible. El portal informa y deriva: esconder que se
 * está saliendo a otro sitio es donde el vecino se pierde.
 */

type Props = {
  titulo: string
  descripcion?: string
  href: string
  externo?: boolean
  Icono: ComponentType<PropsIcono>
  className?: string
}

export const AccesoDestacado = ({
  titulo,
  descripcion,
  href,
  externo = false,
  Icono,
  className,
}: Props) => {
  const contenido = (
    <>
      <span className="bg-acento-suave text-acento mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)]">
        <Icono className="text-[1.4rem]" />
      </span>

      <span className="font-display flex items-center gap-1.5 text-lg leading-snug font-bold">
        {titulo}
        {externo ? <IconoEnlaceExterno className="text-muted-foreground text-[0.9em]" /> : null}
      </span>

      {descripcion ? (
        <span className="text-muted-foreground mt-1 block text-[15px]">{descripcion}</span>
      ) : null}

      <span className="text-primary mt-4 flex items-center gap-1.5 text-sm font-semibold">
        {externo ? 'Ir a la plataforma' : 'Ver más'}
        <IconoFlecha className="transition-transform duration-[var(--duracion-rapida)] ease-[var(--curva-salida)] motion-safe:group-hover:translate-x-1" />
      </span>
    </>
  )

  const clases = cn(
    'group border-border bg-card flex h-full flex-col rounded-[var(--radius-lg)] border p-6',
    'transition-[border-color,box-shadow] duration-[var(--duracion-rapida)]',
    'hover:border-acento hover:shadow-sm',
  )

  if (externo) {
    return (
      <Elevable className={cn('h-full', className)}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${titulo} (se abre en otra ventana)`}
          className={clases}
        >
          {contenido}
        </a>
      </Elevable>
    )
  }

  return (
    <Elevable className={cn('h-full', className)}>
      <Link href={href} className={clases}>
        {contenido}
      </Link>
    </Elevable>
  )
}
