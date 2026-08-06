'use client'

import Image from 'next/image'
import { useState } from 'react'

import { IconoReproducir } from './Iconos'

/**
 * Video de YouTube con carga diferida.
 *
 * Primero se pinta la miniatura y el iframe solo se monta al pulsar. Un iframe
 * de YouTube incrustado de entrada arrastra alrededor de un megabyte de
 * scripts y cookies de terceros **en cada visita**, se vea el video o no. En
 * un sitio municipal que se consulta con datos móviles eso se nota, y además
 * evita instalar rastreadores a quien nunca pidió ver el video.
 *
 * Por lo mismo se usa el dominio sin cookies de YouTube.
 */

export const VideoCard = ({
  idYoutube,
  titulo,
  miniatura,
}: {
  idYoutube: string
  titulo: string
  /** Si no viene, se usa la miniatura que publica YouTube. */
  miniatura?: string
}) => {
  const [activo, setActivo] = useState(false)
  const portada = miniatura ?? `https://i.ytimg.com/vi/${idYoutube}/hqdefault.jpg`

  return (
    <figure className="border-border bg-card overflow-hidden rounded-[var(--radius-lg)] border">
      <div className="bg-muted relative aspect-video">
        {activo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${idYoutube}?autoplay=1`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivo(true)}
            aria-label={`Reproducir el video: ${titulo}`}
            className="group absolute inset-0 cursor-pointer"
          >
            <Image
              src={portada}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-black/65 text-white transition-transform duration-[var(--duracion-rapida)] motion-safe:group-hover:scale-110">
                <IconoReproducir className="text-[2rem]" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="font-display p-4 font-bold">{titulo}</figcaption>
    </figure>
  )
}
