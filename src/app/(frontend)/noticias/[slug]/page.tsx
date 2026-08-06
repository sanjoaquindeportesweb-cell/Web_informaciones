import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ChipCategoria } from '@/componentes/ChipCategoria'
import { TarjetaNoticia } from '@/componentes/TarjetaNoticia'
import { MigaDePan } from '@/componentes/MigaDePan'
import { VistaPreviaEnVivo } from '@/componentes/VistaPreviaEnVivo'
import { fechaLarga, iso } from '@/lib/fecha'
import { jsonLdNoticia } from '@/lib/jsonld'
import { imagenOG } from '@/lib/seo'
import { listarNoticiasRelacionadas, obtenerNoticiaPorSlug } from '@/payload/consultas'
import { resolverVistaPrevia } from '@/payload/vista-previa'
import Image from 'next/image'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const noticia = await obtenerNoticiaPorSlug(slug)
  if (!noticia) return {}

  return {
    title: noticia.seo.titulo,
    description: noticia.seo.descripcion,
    openGraph: {
      title: noticia.seo.titulo,
      description: noticia.seo.descripcion,
      type: 'article',
      publishedTime: noticia.publicadaEn,
      images: imagenOG(noticia.seo.imagen),
    },
    twitter: {
      card: 'summary_large_image',
      title: noticia.seo.titulo,
      description: noticia.seo.descripcion,
      images: imagenOG(noticia.seo.imagen).map((i) => i.url),
    },
  }
}

export default async function PaginaNoticia({ params, searchParams }: Props) {
  const { slug } = await params
  const vistaPrevia = await resolverVistaPrevia(await searchParams)
  const noticia = await obtenerNoticiaPorSlug(slug, vistaPrevia)
  if (!noticia) notFound()

  const relacionadas = await listarNoticiasRelacionadas(noticia.categoria, noticia.slug)

  return (
    <article>
      {vistaPrevia ? <VistaPreviaEnVivo /> : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNoticia(noticia)) }}
      />

      <div className="shell py-10">
        <MigaDePan
          migas={[{ etiqueta: 'Noticias', href: '/noticias' }, { etiqueta: noticia.titulo }]}
        />
      </div>

      <div className="shell max-w-3xl pb-16">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ChipCategoria categoria={noticia.categoria} />
          <time dateTime={iso(noticia.publicadaEn)} className="text-muted-foreground text-sm">
            {fechaLarga(noticia.publicadaEn)}
          </time>
        </div>

        <h1 className="font-display text-[32px] leading-[1.05] font-black md:text-[48px]">
          {noticia.titulo}
        </h1>

        {noticia.bajada ? (
          <p className="text-muted-foreground mt-4 text-lg">{noticia.bajada}</p>
        ) : null}

        {noticia.portada ? (
          <div className="bg-muted relative mt-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
            <Image
              src={noticia.portada.url}
              alt={noticia.portada.alt}
              fill
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              placeholder={noticia.portada.desenfoque ? 'blur' : 'empty'}
              blurDataURL={noticia.portada.desenfoque}
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="prosa mt-8" dangerouslySetInnerHTML={{ __html: noticia.cuerpoHTML }} />
      </div>

      {relacionadas.length > 0 ? (
        <div className="border-border border-t py-14 md:py-20">
          <div className="shell">
            <h2 className="font-display mb-8 text-[26px] leading-tight font-bold md:text-[34px]">
              Más noticias de esta categoría
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relacionadas.map((n) => (
                <TarjetaNoticia key={n.slug} noticia={n} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
