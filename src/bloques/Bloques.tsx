import Image from 'next/image'

import { FiloBanderola } from '@/componentes/Banderola'
import { BotonEnlace } from '@/componentes/Boton'
import { FormularioDinamico, type DatosFormulario } from '@/componentes/FormularioDinamico'
import { Galeria } from '@/componentes/Galeria'
import { IconoChevronAbajo } from '@/componentes/Iconos'
import { VideoCard } from '@/componentes/VideoCard'
import { cn } from '@/lib/cn'
import type { Imagen } from '@/tipos'

/**
 * Bloques del constructor de páginas.
 *
 * Cada bloque que el editor puede insertar en Payload tiene aquí su
 * componente. La correspondencia es uno a uno y por el campo `tipo`: añadir un
 * bloque nuevo es añadirlo al `Bloque` de abajo, escribir su componente y
 * declararlo en la colección `paginas`.
 */

export type Bloque =
  | { tipo: 'texto'; html: string }
  | { tipo: 'imagen'; imagen: Imagen; pie?: string }
  | { tipo: 'galeria'; titulo?: string; imagenes: Imagen[] }
  | { tipo: 'cita'; texto: string; autor?: string; cargo?: string }
  | { tipo: 'preguntas'; titulo?: string; items: { pregunta: string; respuesta: string }[] }
  | { tipo: 'horarios'; titulo?: string; filas: { dia: string; horario: string }[] }
  | {
      tipo: 'llamada'
      titulo: string
      texto?: string
      enlace: string
      textoEnlace: string
      externo?: boolean
    }
  | { tipo: 'video'; idYoutube: string; titulo: string }
  | { tipo: 'formulario'; form: DatosFormulario }
  | { tipo: 'separador' }

export const Bloques = ({ bloques }: { bloques: Bloque[] }) => (
  <>
    {bloques.map((bloque, i) => (
      <BloqueUno key={i} bloque={bloque} />
    ))}
  </>
)

const BloqueUno = ({ bloque }: { bloque: Bloque }) => {
  switch (bloque.tipo) {
    case 'texto':
      return (
        <div
          /* El ancho de línea se limita a ~68 caracteres: un párrafo que cruza
             los 1200px del contenedor es incómodo de leer y se pierde el
             renglón al bajar. */
          className="prosa mx-auto max-w-[68ch]"
          dangerouslySetInnerHTML={{ __html: bloque.html }}
        />
      )

    case 'imagen':
      return (
        <figure className="mx-auto max-w-4xl">
          <Image
            src={bloque.imagen.url}
            alt={bloque.imagen.alt}
            width={bloque.imagen.ancho ?? 1600}
            height={bloque.imagen.alto ?? 900}
            sizes="(min-width: 1024px) 900px, 100vw"
            placeholder={bloque.imagen.desenfoque ? 'blur' : 'empty'}
            blurDataURL={bloque.imagen.desenfoque}
            className="w-full rounded-[var(--radius-lg)]"
          />
          {bloque.pie ? (
            <figcaption className="text-muted-foreground mt-2 text-center text-sm">
              {bloque.pie}
            </figcaption>
          ) : null}
        </figure>
      )

    case 'galeria':
      return (
        <div>
          {bloque.titulo ? <TituloBloque>{bloque.titulo}</TituloBloque> : null}
          <Galeria imagenes={bloque.imagenes} titulo={bloque.titulo} />
        </div>
      )

    case 'cita':
      return (
        <figure className="border-acento mx-auto max-w-3xl border-l-6 pl-6">
          <blockquote className="font-display text-[22px] leading-snug font-medium md:text-[28px]">
            «{bloque.texto}»
          </blockquote>
          {bloque.autor ? (
            <figcaption className="text-muted-foreground mt-3">
              <span className="text-foreground font-semibold">{bloque.autor}</span>
              {bloque.cargo ? `, ${bloque.cargo}` : null}
            </figcaption>
          ) : null}
        </figure>
      )

    case 'preguntas':
      return (
        <div className="mx-auto max-w-3xl">
          {bloque.titulo ? <TituloBloque>{bloque.titulo}</TituloBloque> : null}
          <div className="grid gap-2">
            {bloque.items.map((item) => (
              /* <details> nativo: se abre con teclado, lo anuncian los
                 lectores de pantalla y funciona aunque falle el JavaScript.
                 Un acordeón hecho a mano rara vez consigue las tres cosas. */
              <details
                key={item.pregunta}
                className="group border-border bg-card rounded-[var(--radius)] border"
              >
                <summary className="toque flex cursor-pointer items-center justify-between gap-4 px-5 py-3 font-semibold marker:content-['']">
                  {item.pregunta}
                  <IconoChevronAbajo className="text-muted-foreground shrink-0 transition-transform duration-[var(--duracion-rapida)] group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-5 pb-4">{item.respuesta}</div>
              </details>
            ))}
          </div>
        </div>
      )

    case 'horarios':
      return (
        <div className="mx-auto max-w-3xl">
          {bloque.titulo ? <TituloBloque>{bloque.titulo}</TituloBloque> : null}
          <table className="border-border w-full overflow-hidden rounded-[var(--radius)] border text-left">
            <caption className="sr-only">{bloque.titulo ?? 'Horarios de atención'}</caption>
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Día
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Horario
                </th>
              </tr>
            </thead>
            <tbody>
              {bloque.filas.map((fila) => (
                <tr key={fila.dia} className="border-border border-t">
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    {fila.dia}
                  </th>
                  <td className="tabular px-4 py-2.5">{fila.horario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'llamada':
      return (
        <div className="bg-acento-suave mx-auto max-w-4xl rounded-[var(--radius-lg)] p-8 text-center md:p-12">
          <h2 className="font-display text-[26px] leading-tight font-bold md:text-[34px]">
            {bloque.titulo}
          </h2>
          {bloque.texto ? (
            <p className="text-muted-foreground mx-auto mt-3 max-w-xl">{bloque.texto}</p>
          ) : null}
          <BotonEnlace
            href={bloque.enlace}
            externo={bloque.externo}
            tamano="lg"
            className="mt-6"
          >
            {bloque.textoEnlace}
          </BotonEnlace>
        </div>
      )

    case 'video':
      return (
        <div className="mx-auto max-w-3xl">
          <VideoCard idYoutube={bloque.idYoutube} titulo={bloque.titulo} />
        </div>
      )

    case 'formulario':
      return (
        <div className="border-border bg-card mx-auto w-full max-w-2xl rounded-[var(--radius-lg)] border p-6 md:p-8">
          <FormularioDinamico form={bloque.form} />
        </div>
      )

    case 'separador':
      return <FiloBanderola className="mx-auto max-w-4xl rounded-full" />
  }
}

const TituloBloque = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn('font-display mb-5 text-[26px] leading-tight font-bold md:text-[34px]', className)}>
    {children}
  </h2>
)
