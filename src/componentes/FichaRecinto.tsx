import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import { entero } from '@/lib/formato'
import type { Recinto } from '@/tipos'
import { BotonEnlace } from './Boton'
import { Elevable } from './Elevable'
import { EstadoEnVivo } from './EstadoEnVivo'
import { IconoUbicacion } from './Iconos'

/**
 * Ficha de recinto deportivo.
 *
 * En `compacta` es la tarjeta de la cuadrícula; en `completa` encabeza la
 * página del recinto. El estado en vivo va en ambas: saber si la piscina está
 * abierta ahora es la consulta que trae a la gente al sitio. El botón de
 * arriendo también, para no obligar a entrar al detalle solo para arrendar.
 */

type Props = {
  recinto: Recinto
  variante?: 'compacta' | 'completa'
  prioridad?: boolean
  className?: string
}

export const FichaRecinto = ({
  recinto,
  variante = 'compacta',
  prioridad = false,
  className,
}: Props) => {
  const completa = variante === 'completa'
  const href = `/recintos/${recinto.slug}`

  const ficha = (
    <article
      className={cn(
        'border-border bg-card group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border',
        !completa &&
          'focus-within:ring-ring transition-shadow duration-[var(--duracion-rapida)] hover:shadow-md focus-within:ring-3 focus-within:ring-offset-2',
        completa && className,
      )}
    >
      {recinto.portada ? (
        <div className={cn('bg-muted relative', completa ? 'aspect-[21/9]' : 'aspect-[16/10]')}>
          <Image
            src={recinto.portada.url}
            alt={recinto.portada.alt}
            fill
            priority={prioridad}
            sizes={completa ? '100vw' : '(min-width: 640px) 50vw, 100vw'}
            placeholder={recinto.portada.desenfoque ? 'blur' : 'empty'}
            blurDataURL={recinto.portada.desenfoque}
            className="object-cover"
          />
        </div>
      ) : null}

      <div className={cn('flex flex-1 flex-col gap-3', completa ? 'p-6 md:p-8' : 'p-5')}>
        <div>
          {completa ? (
            /* La ficha completa encabeza la página del recinto: es su único
               h1, no un h3 — de lo contrario la página no tiene titular
               principal para quien navega por encabezados. */
            <h1 className="font-display text-[26px] leading-tight font-bold md:text-[34px]">
              {recinto.nombre}
            </h1>
          ) : (
            <h3 className="font-display text-xl leading-tight font-bold">
              <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
                {recinto.nombre}
              </Link>
            </h3>
          )}

          <p className="text-muted-foreground mt-1.5 flex items-start gap-1.5 text-[15px]">
            <IconoUbicacion className="text-acento mt-0.5 shrink-0" />
            {recinto.direccion}
          </p>
        </div>

        <EstadoEnVivo horarios={recinto.horarios} />

        {recinto.disciplinas.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {recinto.disciplinas.map((d) => (
              <li
                key={d}
                className="bg-muted text-foreground rounded-full px-2.5 py-1 text-xs font-semibold"
              >
                {d}
              </li>
            ))}
          </ul>
        ) : null}

        {completa ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {recinto.aforo ? (
              <p className="text-muted-foreground text-[15px]">
                Aforo <span className="text-foreground tabular font-semibold">{entero(recinto.aforo)}</span>{' '}
                personas
              </p>
            ) : null}
            {recinto.urlReserva ? (
              /* Sale a la plataforma de trámites: el arriendo no vive aquí. */
              <BotonEnlace href={recinto.urlReserva} externo>
                Arrendar este recinto
              </BotonEnlace>
            ) : null}
          </div>
        ) : recinto.urlReserva ? (
          /* `relative z-10` no es decorativo: el enlace del título estira un
             pseudo-elemento sobre toda la tarjeta (`after:inset-0`) para que
             se pueda pinchar entera. Sin levantar el botón, esa capa se come
             el clic y el arriendo termina llevando al detalle del recinto.

             `mt-auto` lo pega abajo: las tarjetas de una fila tienen distinta
             cantidad de disciplinas y sin esto los botones quedan a alturas
             distintas. */
          <div className="relative z-10 mt-auto pt-1">
            <BotonEnlace
              href={recinto.urlReserva}
              externo
              tamano="sm"
              /* En la cuadrícula hay varios botones idénticos: quien navega por
                 enlaces con lector de pantalla necesita saber cuál es cuál, y
                 «Arrendar» a secas no lo dice. El texto visible sí puede ser
                 corto, que el nombre ya está en la tarjeta. */
              aria-label={`Arrendar ${recinto.nombre} (se abre en otra ventana)`}
            >
              Arrendar
            </BotonEnlace>
          </div>
        ) : null}
      </div>
    </article>
  )

  return completa ? ficha : <Elevable className={className}>{ficha}</Elevable>
}
