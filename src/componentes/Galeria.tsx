'use client'

import Image from 'next/image'
import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { m, transicion, useReducedMotion } from '@/lib/movimiento'
import type { Imagen } from '@/tipos'
import { IconoCerrar, IconoChevronDer, IconoChevronIzq } from './Iconos'

/**
 * Galería con visor propio.
 *
 * El visor es un `<dialog>` nativo abierto con `showModal()`, y no un div con
 * posición fija. Eso trae gratis y bien hechas tres cosas que a mano casi
 * siempre salen mal: el foco queda atrapado dentro, `Esc` cierra, y el resto
 * de la página queda inerte para el lector de pantalla.
 */

export const Galeria = ({ imagenes, titulo }: { imagenes: Imagen[]; titulo?: string }) => {
  const [abierta, setAbierta] = useState<number | null>(null)
  const dialogo = useRef<HTMLDialogElement>(null)
  const disparador = useRef<HTMLButtonElement | null>(null)

  const total = imagenes.length

  const abrir = (i: number, boton: HTMLButtonElement) => {
    disparador.current = boton
    setAbierta(i)
    dialogo.current?.showModal()
  }

  const cerrar = useCallback(() => {
    dialogo.current?.close()
    setAbierta(null)
    /* Devolver el foco al miniaturado del que se salió: si no, el teclado
       vuelve al principio de la página y hay que recorrerla entera. */
    disparador.current?.focus()
  }, [])

  const mover = useCallback(
    (delta: number) => setAbierta((i) => (i === null ? null : (i + delta + total) % total)),
    [total],
  )

  useEffect(() => {
    const el = dialogo.current
    if (!el) return

    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') mover(1)
      if (e.key === 'ArrowLeft') mover(-1)
    }
    /* `cancel` es el Esc del propio dialog: se engancha para limpiar el estado
       y devolver el foco, que showModal() por sí solo no hace. */
    const alCancelar = (e: Event) => {
      e.preventDefault()
      cerrar()
    }

    el.addEventListener('keydown', alTeclado)
    el.addEventListener('cancel', alCancelar)
    return () => {
      el.removeEventListener('keydown', alTeclado)
      el.removeEventListener('cancel', alCancelar)
    }
  }, [mover, cerrar])

  const menos = useReducedMotion()

  if (total === 0) return null

  const activa = abierta === null ? null : imagenes[abierta]

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {imagenes.map((img, i) => (
          <li key={`${img.url}-${i}`}>
            <button
              type="button"
              onClick={(e) => abrir(i, e.currentTarget)}
              className="group bg-muted focus-visible:ring-ring relative block aspect-square w-full cursor-pointer overflow-hidden rounded-[var(--radius-sm)]"
              aria-label={`Ampliar imagen ${i + 1} de ${total}: ${img.alt}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                placeholder={img.desenfoque ? 'blur' : 'empty'}
                blurDataURL={img.desenfoque}
                className="object-cover transition-transform duration-[var(--duracion-media)] ease-[var(--curva-entrada)] motion-safe:group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* El clic en el fondo cierra. No necesita equivalente de teclado porque
          el propio <dialog> ya cierra con Esc de forma nativa, que es el
          requisito real de la WCAG; la regla de lint no sabe distinguirlo. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogo}
        aria-label={titulo ? `Galería: ${titulo}` : 'Galería de imágenes'}
        className="bg-transparent backdrop:bg-black/80 m-auto max-h-dvh max-w-[100vw] p-0"
        onClick={(e) => {
          if (e.target === dialogo.current) cerrar()
        }}
      >
        {activa ? (
          <figure className="relative flex max-h-dvh flex-col items-center justify-center p-4">
            {/* Se funde entre una imagen y la siguiente en vez de saltar: la
               `key` por índice es lo que le dice a AnimatePresence que hay una
               imagen nueva que animar, no la misma actualizada. */}
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={abierta}
                className="relative max-h-[80dvh] w-[min(92vw,1100px)]"
                initial={menos ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={menos ? undefined : { opacity: 0 }}
                transition={transicion.rapida}
              >
                <Image
                  src={activa.url}
                  alt={activa.alt}
                  width={activa.ancho ?? 1600}
                  height={activa.alto ?? 1067}
                  placeholder={activa.desenfoque ? 'blur' : 'empty'}
                  blurDataURL={activa.desenfoque}
                  className="max-h-[80dvh] w-full rounded-[var(--radius)] object-contain"
                />
              </m.div>
            </AnimatePresence>
            <figcaption className="tabular mt-3 text-center text-sm text-white/90">
              {activa.alt}
              <span className="ml-2 text-white/60">
                {(abierta ?? 0) + 1} / {total}
              </span>
            </figcaption>

            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar la galería"
              className="toque absolute top-4 right-4 grid cursor-pointer place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <IconoCerrar />
            </button>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => mover(-1)}
                  aria-label="Imagen anterior"
                  className="toque absolute top-1/2 left-4 grid -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <IconoChevronIzq />
                </button>
                <button
                  type="button"
                  onClick={() => mover(1)}
                  aria-label="Imagen siguiente"
                  className="toque absolute top-1/2 right-4 grid -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <IconoChevronDer />
                </button>
              </>
            ) : null}
          </figure>
        ) : null}
      </dialog>
    </>
  )
}
