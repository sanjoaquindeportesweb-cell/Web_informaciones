'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import type { Destacado } from '@/tipos'
import { BotonEnlace } from './Boton'
import { IconoChevronDer, IconoChevronIzq } from './Iconos'

/**
 * Carrusel de destacados de portada. Hasta cinco piezas, editables desde el
 * panel.
 *
 * Un carrusel es de los componentes que peor se implementan, así que aquí van
 * las reglas explícitas:
 *
 * - **Nunca es la única forma de llegar a un contenido.** Lo que se destaca
 *   tiene además su propia página y su enlace en el menú. Quien no ve el
 *   tercer cuadro no se pierde nada.
 * - **Se puede detener.** El avance automático se pausa al pasar el cursor, al
 *   enfocar con el teclado y con `prefers-reduced-motion`, y además hay un
 *   botón de pausa: la WCAG 2.2.2 exige un control explícito para cualquier
 *   cosa que se mueva sola más de cinco segundos, y el hover no lo es —con el
 *   dedo no existe.
 * - Los cuadros ocultos van con `aria-hidden` y sus enlaces sin foco, para que
 *   el tabulador no caiga en algo invisible.
 */

const INTERVALO = 7000

export const CarruselDestacados = ({ destacados }: { destacados: Destacado[] }) => {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [interaccion, setInteraccion] = useState(false)
  const [menosMovimiento, setMenosMovimiento] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  const total = destacados.length

  const ir = useCallback((indice: number) => setActual(((indice % total) + total) % total), [total])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const leer = () => setMenosMovimiento(mq.matches)
    leer()
    mq.addEventListener('change', leer)
    return () => mq.removeEventListener('change', leer)
  }, [])

  useEffect(() => {
    if (total <= 1 || pausado || interaccion || menosMovimiento) return
    const id = setInterval(() => setActual((i) => (i + 1) % total), INTERVALO)
    return () => clearInterval(id)
  }, [total, pausado, interaccion, menosMovimiento])

  const alTeclado = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      ir(actual + 1)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      ir(actual - 1)
    }
  }

  if (total === 0) return null

  const detenido = pausado || menosMovimiento

  return (
    /* Las flechas del teclado se escuchan en el contenedor, que es lo que
       describe el patrón de carrusel de la WAI-ARIA: el foco está en alguno de
       los controles de dentro y el evento sube hasta aquí. La regla de lint
       supone que un contenedor con listeners debería ser un control, y en este
       patrón concreto no lo es. */
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      ref={contenedor}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onMouseEnter={() => setInteraccion(true)}
      onMouseLeave={() => setInteraccion(false)}
      onFocusCapture={() => setInteraccion(true)}
      onBlurCapture={() => setInteraccion(false)}
      onKeyDown={alTeclado}
      className="relative"
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] sm:aspect-[21/9]">
        {destacados.map((d, i) => {
          const visible = i === actual
          return (
            <div
              key={d.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={!visible}
              /* `inert` saca del tabulador todo lo que hay dentro del cuadro
                 oculto; sin esto el foco desaparece de la pantalla. */
              inert={!visible}
              className={cn(
                'absolute inset-0 transition-opacity duration-[var(--duracion-lenta)] ease-[var(--curva-entrada)]',
                visible ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <Image
                src={d.imagen.url}
                alt={d.imagen.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1200px) 1200px, 100vw"
                placeholder={d.imagen.desenfoque ? 'blur' : 'empty'}
                blurDataURL={d.imagen.desenfoque}
                className="object-cover"
              />
              {/* Velo oscuro: sin él, un titular blanco sobre una foto clara
                  se vuelve ilegible y el contraste deja de estar garantizado. */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <h2 className="font-display max-w-2xl text-[26px] leading-tight font-black text-white md:text-[40px]">
                  {d.titulo}
                </h2>
                {d.bajada ? (
                  <p className="mt-2 max-w-xl text-white/90 md:text-lg">{d.bajada}</p>
                ) : null}
                <BotonEnlace
                  href={d.enlace}
                  externo={d.externo}
                  variante="sobreVioleta"
                  className="mt-5"
                >
                  {d.textoEnlace ?? 'Ver más'}
                </BotonEnlace>
              </div>
            </div>
          )
        })}
      </div>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BotonControl etiqueta="Destacado anterior" onClick={() => ir(actual - 1)}>
              <IconoChevronIzq />
            </BotonControl>
            <BotonControl etiqueta="Destacado siguiente" onClick={() => ir(actual + 1)}>
              <IconoChevronDer />
            </BotonControl>
            <BotonControl
              etiqueta={detenido ? 'Reanudar el avance automático' : 'Detener el avance automático'}
              onClick={() => setPausado((p) => !p)}
              presionado={detenido}
            >
              {detenido ? <Reproducir /> : <Pausa />}
            </BotonControl>
          </div>

          <ul className="flex items-center gap-1">
            {destacados.map((d, i) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => ir(i)}
                  aria-label={`Ir al destacado ${i + 1}: ${d.titulo}`}
                  aria-current={i === actual ? 'true' : undefined}
                  /* El punto se ve pequeño, pero el área táctil es de 44px:
                     el relleno transparente hace el trabajo. */
                  className="toque grid cursor-pointer place-items-center px-1"
                >
                  <span
                    className={cn(
                      'block h-2.5 rounded-full transition-all duration-[var(--duracion-rapida)]',
                      i === actual ? 'bg-primary w-7' : 'bg-border w-2.5',
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

const BotonControl = ({
  etiqueta,
  onClick,
  presionado,
  children,
}: {
  etiqueta: string
  onClick: () => void
  presionado?: boolean
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={etiqueta}
    aria-pressed={presionado}
    className="toque border-border bg-card text-foreground hover:bg-muted grid cursor-pointer place-items-center rounded-full border transition-colors duration-[var(--duracion-rapida)]"
  >
    {children}
  </button>
)

const Pausa = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="currentColor" aria-hidden="true">
    <rect x="7" y="6" width="3.5" height="12" rx="1" />
    <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
  </svg>
)

const Reproducir = () => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5 18 12 8 18.5v-13Z" />
  </svg>
)
