import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Bloques } from '@/bloques/Bloques'
import { MigaDePan } from '@/componentes/MigaDePan'
import { VistaPreviaEnVivo } from '@/componentes/VistaPreviaEnVivo'
import { imagenOG } from '@/lib/seo'
import { listarSlugsDePaginas, obtenerPaginaPorSlug } from '@/payload/consultas'
import { resolverVistaPrevia } from '@/payload/vista-previa'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/* Rutas conocidas de antemano: Next las pre-construye en vez de resolverlas
   una a una en la primera visita. Los slugs nuevos que aún no estaban al
   compilar se resuelven igual, bajo demanda. */
export const generateStaticParams = async () => {
  const slugs = await listarSlugsDePaginas()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pagina = await obtenerPaginaPorSlug(slug)
  if (!pagina) return {}

  return {
    title: pagina.seo.titulo,
    description: pagina.seo.descripcion,
    openGraph: {
      title: pagina.seo.titulo,
      description: pagina.seo.descripcion,
      images: imagenOG(pagina.seo.imagen),
    },
    twitter: {
      card: 'summary_large_image',
      title: pagina.seo.titulo,
      description: pagina.seo.descripcion,
      images: imagenOG(pagina.seo.imagen).map((i) => i.url),
    },
  }
}

export default async function PaginaPorBloques({ params, searchParams }: Props) {
  const { slug } = await params
  const vistaPrevia = await resolverVistaPrevia(await searchParams)
  const pagina = await obtenerPaginaPorSlug(slug, vistaPrevia)
  if (!pagina) notFound()

  return (
    <>
      {vistaPrevia ? <VistaPreviaEnVivo /> : null}

      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: pagina.titulo }]} />
        <h1 className="font-display mt-4 text-[32px] leading-[1.05] font-black md:text-[48px]">
          {pagina.titulo}
        </h1>

        {pagina.portada ? (
          <div className="bg-muted relative mt-8 aspect-[21/9] overflow-hidden rounded-[var(--radius-lg)]">
            <Image
              src={pagina.portada.url}
              alt={pagina.portada.alt}
              fill
              priority
              sizes="(min-width: 1200px) 1200px, 100vw"
              placeholder={pagina.portada.desenfoque ? 'blur' : 'empty'}
              blurDataURL={pagina.portada.desenfoque}
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="shell grid gap-12 pb-16 md:pb-24">
        <Bloques bloques={pagina.bloques} />
      </div>
    </>
  )
}
