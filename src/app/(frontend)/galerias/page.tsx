import Image from 'next/image'
import Link from 'next/link'

import { EstadoVacio } from '@/componentes/Estados'
import { IconoImagen } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { ListaEscalonada } from '@/lib/movimiento'
import { metadatosDeListado } from '@/lib/seo'
import { listarGalerias } from '@/payload/consultas'

/* Dinámica por lo mismo que la portada: prerenderizada en el build, en Amplify
   se quedaba clavada con las galerías que existían al compilar. Ver el comentario
   largo en `app/(frontend)/page.tsx`. */
export const dynamic = 'force-dynamic'

export const metadata = metadatosDeListado(
  'Galerías',
  'Álbumes de fotos de actividades y campeonatos de la Corporación.',
)

export default async function PaginaGalerias() {
  const galerias = await listarGalerias()

  return (
    <>
      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: 'Galerías' }]} />
        <h1 className="font-display mt-4 text-[40px] leading-[1.02] font-black md:text-[56px]">
          Galerías
        </h1>
      </div>

      <div className="shell pb-16 md:pb-24">
        {galerias.length === 0 ? (
          <EstadoVacio
            titulo="Sin galerías publicadas todavía"
            descripcion="Cuando se publique la primera, aparecerá aquí."
            Icono={IconoImagen}
          />
        ) : (
          <ListaEscalonada className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" as="ul">
            {galerias.map((g) => (
              <article
                key={g.slug}
                className="group border-border bg-card focus-within:ring-ring relative overflow-hidden rounded-[var(--radius-lg)] border focus-within:ring-3 focus-within:ring-offset-2"
              >
                {g.portada ? (
                  <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={g.portada.url}
                      alt={g.portada.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      placeholder={g.portada.desenfoque ? 'blur' : 'empty'}
                      blurDataURL={g.portada.desenfoque}
                      className="object-cover transition-transform duration-[var(--duracion-lenta)] ease-[var(--curva-entrada)] motion-safe:group-hover:scale-[1.03]"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <h2 className="font-display text-xl font-bold">
                    <Link href={`/galerias/${g.slug}`} className="after:absolute after:inset-0 focus:outline-none">
                      {g.titulo}
                    </Link>
                  </h2>
                  {g.descripcion ? (
                    <p className="text-muted-foreground mt-1.5">{g.descripcion}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </ListaEscalonada>
        )}
      </div>
    </>
  )
}
