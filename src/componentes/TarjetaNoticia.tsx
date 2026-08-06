import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import { fechaCorta, fechaLarga, iso } from '@/lib/fecha'
import type { Noticia } from '@/tipos'
import { categoriaDe } from './categorias'
import { ChipCategoria } from './ChipCategoria'
import { Elevable } from './Elevable'

/**
 * Tarjeta de noticia, en tres variantes.
 *
 * La portada no es una cuadrícula de tarjetas iguales: la principal ocupa dos
 * tercios con la foto a sangre y las secundarias caen en columna. La jerarquía
 * tiene que verse antes de leer.
 *
 * Toda la tarjeta es clicable, pero el enlace envuelve solo al titular y se
 * extiende con un pseudo-elemento. Así el lector de pantalla anuncia un enlace
 * con el texto del titular, en vez de leer en voz alta la fecha, la categoría
 * y la bajada como si fueran su nombre.
 */

type Variante = 'destacada' | 'estandar' | 'compacta'

type Props = {
  noticia: Noticia
  variante?: Variante
  /** Solo la primera imagen visible de la portada debe ser prioritaria. */
  prioridad?: boolean
  className?: string
}

export const TarjetaNoticia = ({
  noticia,
  variante = 'estandar',
  prioridad = false,
  className,
}: Props) => {
  const categoria = categoriaDe(noticia.categoria)
  const href = `/noticias/${noticia.slug}`

  if (variante === 'compacta') {
    return (
      <article
        className={cn(
          'group focus-within:ring-ring relative flex gap-4 rounded-[var(--radius)] focus-within:ring-3 focus-within:ring-offset-2',
          className,
        )}
      >
        {noticia.portada ? (
          <div className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
            <Image
              src={noticia.portada.url}
              alt={noticia.portada.alt}
              fill
              sizes="96px"
              placeholder={noticia.portada.desenfoque ? 'blur' : 'empty'}
              blurDataURL={noticia.portada.desenfoque}
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="min-w-0">
          <Fecha valor={noticia.publicadaEn} className={categoria.texto} />
          <h3 className="font-display mt-1 leading-snug font-bold">
            <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
              {noticia.titulo}
            </Link>
          </h3>
        </div>
      </article>
    )
  }

  const destacada = variante === 'destacada'

  return (
    <Elevable className={cn('h-full', className)}>
      <article className="group border-border bg-card focus-within:ring-ring relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-shadow duration-[var(--duracion-rapida)] hover:shadow-md focus-within:ring-3 focus-within:ring-offset-2 focus-within:-translate-y-1">
      {noticia.portada ? (
        <div
          className={cn(
            'bg-muted relative overflow-hidden',
            destacada ? 'aspect-[16/10] md:aspect-[16/9]' : 'aspect-[16/10]',
            /* El corte a 30°, el mismo ángulo de la banderola. Solo en la
               destacada: repetirlo en cada tarjeta lo vuelve ruido. */
            destacada && 'corte-30 [--corte:94%]',
          )}
        >
          <Image
            src={noticia.portada.url}
            alt={noticia.portada.alt}
            fill
            priority={prioridad}
            sizes={destacada ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 640px) 50vw, 100vw'}
            placeholder={noticia.portada.desenfoque ? 'blur' : 'empty'}
            blurDataURL={noticia.portada.desenfoque}
            className="object-cover transition-transform duration-[var(--duracion-lenta)] ease-[var(--curva-entrada)] motion-safe:group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      {/* Filete de 6px con la tinta de la categoría. */}
      <div className={cn('h-1.5 w-full', categoria.filete)} aria-hidden="true" />

      <div className={cn('flex flex-1 flex-col', destacada ? 'gap-3 p-6 md:p-8' : 'gap-2 p-5')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <ChipCategoria categoria={noticia.categoria} tamano="sm" />
          <Fecha valor={noticia.publicadaEn} />
        </div>

        <h3
          className={cn(
            'font-display leading-tight font-bold',
            destacada ? 'text-[26px] md:text-[34px]' : 'text-xl',
          )}
        >
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
            {noticia.titulo}
          </Link>
        </h3>

        {noticia.bajada ? (
          <p className={cn('text-muted-foreground', destacada ? 'max-w-2xl text-lg' : 'text-base')}>
            {noticia.bajada}
          </p>
        ) : null}
        </div>
      </article>
    </Elevable>
  )
}

const Fecha = ({ valor, className }: { valor: string; className?: string }) => (
  <time
    dateTime={iso(valor)}
    /* El texto visible va abreviado y el lector de pantalla recibe la fecha
       completa: «5 ago 2026» se lee como «cinco agosto dos mil veintiséis». */
    aria-label={fechaLarga(valor)}
    className={cn(
      'text-muted-foreground text-[11px] font-bold tracking-[0.14em] uppercase',
      className,
    )}
  >
    {fechaCorta(valor)}
  </time>
)
