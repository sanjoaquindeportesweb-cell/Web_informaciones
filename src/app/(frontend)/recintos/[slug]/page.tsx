import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FichaRecinto } from '@/componentes/FichaRecinto'
import { IconoUbicacion } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { BotonEnlace } from '@/componentes/Boton'
import { VistaPreviaEnVivo } from '@/componentes/VistaPreviaEnVivo'
import { jsonLdRecinto } from '@/lib/jsonld'
import { imagenOG } from '@/lib/seo'
import { obtenerRecintoPorSlug } from '@/payload/consultas'
import { resolverVistaPrevia } from '@/payload/vista-previa'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recinto = await obtenerRecintoPorSlug(slug)
  if (!recinto) return {}

  return {
    title: recinto.seo.titulo,
    description: recinto.seo.descripcion,
    openGraph: {
      title: recinto.seo.titulo,
      description: recinto.seo.descripcion,
      images: imagenOG(recinto.seo.imagen),
    },
    twitter: {
      card: 'summary_large_image',
      title: recinto.seo.titulo,
      description: recinto.seo.descripcion,
      images: imagenOG(recinto.seo.imagen).map((i) => i.url),
    },
  }
}

export default async function PaginaRecinto({ params, searchParams }: Props) {
  const { slug } = await params
  const vistaPrevia = await resolverVistaPrevia(await searchParams)
  const recinto = await obtenerRecintoPorSlug(slug, vistaPrevia)
  if (!recinto) notFound()

  const urlMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(recinto.direccion)}`

  return (
    <>
      {vistaPrevia ? <VistaPreviaEnVivo /> : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRecinto(recinto)) }}
      />

      <div className="shell py-10">
        <MigaDePan
          migas={[{ etiqueta: 'Recintos', href: '/recintos' }, { etiqueta: recinto.nombre }]}
        />
      </div>

      <div className="shell pb-16 md:pb-24">
        <FichaRecinto recinto={recinto} variante="completa" prioridad />

        <div className="mt-6">
          <BotonEnlace href={urlMapa} externo variante="secundario">
            <IconoUbicacion />
            Cómo llegar
          </BotonEnlace>
        </div>
      </div>
    </>
  )
}
