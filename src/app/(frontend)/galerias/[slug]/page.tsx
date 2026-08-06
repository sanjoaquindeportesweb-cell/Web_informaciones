import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Galeria } from '@/componentes/Galeria'
import { MigaDePan } from '@/componentes/MigaDePan'
import { VistaPreviaEnVivo } from '@/componentes/VistaPreviaEnVivo'
import { imagenOG } from '@/lib/seo'
import { obtenerGaleriaPorSlug } from '@/payload/consultas'
import { resolverVistaPrevia } from '@/payload/vista-previa'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const galeria = await obtenerGaleriaPorSlug(slug)
  if (!galeria) return {}

  return {
    title: galeria.seo.titulo,
    description: galeria.seo.descripcion,
    openGraph: {
      title: galeria.seo.titulo,
      description: galeria.seo.descripcion,
      images: imagenOG(galeria.seo.imagen),
    },
    twitter: {
      card: 'summary_large_image',
      title: galeria.seo.titulo,
      description: galeria.seo.descripcion,
      images: imagenOG(galeria.seo.imagen).map((i) => i.url),
    },
  }
}

export default async function PaginaGaleria({ params, searchParams }: Props) {
  const { slug } = await params
  const vistaPrevia = await resolverVistaPrevia(await searchParams)
  const galeria = await obtenerGaleriaPorSlug(slug, vistaPrevia)
  if (!galeria) notFound()

  return (
    <>
      {vistaPrevia ? <VistaPreviaEnVivo /> : null}

      <div className="shell py-10">
        <MigaDePan
          migas={[{ etiqueta: 'Galerías', href: '/galerias' }, { etiqueta: galeria.titulo }]}
        />
        <h1 className="font-display mt-4 text-[32px] leading-[1.05] font-black md:text-[48px]">
          {galeria.titulo}
        </h1>
        {galeria.descripcion ? (
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">{galeria.descripcion}</p>
        ) : null}
      </div>

      <div className="shell pb-16 md:pb-24">
        <Galeria imagenes={galeria.imagenes} titulo={galeria.titulo} />
      </div>
    </>
  )
}
