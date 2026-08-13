import Link from 'next/link'

import { URL_DEL_SITIO } from '@/constantes/sitio'
import { IconoChevronDer } from './Iconos'

/**
 * Migas de pan, en todas las rutas salvo la portada.
 *
 * Emite además el JSON-LD de BreadcrumbList: es lo que hace que Google muestre
 * «Inicio › Recintos › Piscina» en el resultado en vez de la URL cruda.
 */

export type Miga = { etiqueta: string; href?: string }

/* `URL_DEL_SITIO` es la misma constante que usan el sitemap, el RSS y los datos
   estructurados de noticias/recintos — no un dominio adivinado a mano. Un valor
   escrito aquí se desincroniza en cuanto el sitio se muda de dominio, y encima
   emitía la URL de producción mientras se probaba en localhost. */

export const MigaDePan = ({ migas, base = URL_DEL_SITIO }: {
  migas: Miga[]
  base?: string
}) => {
  const completas: Miga[] = [{ etiqueta: 'Inicio', href: '/' }, ...migas]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: completas.map((miga, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: miga.etiqueta,
      ...(miga.href ? { item: `${base}${miga.href}` } : {}),
    })),
  }

  return (
    <nav aria-label="Ruta de navegación" className="text-sm">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5">
        {completas.map((miga, i) => {
          const ultima = i === completas.length - 1
          return (
            <li key={`${miga.etiqueta}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <IconoChevronDer className="text-[0.85em] opacity-60" /> : null}
              {miga.href && !ultima ? (
                <Link href={miga.href} className="hover:text-foreground underline-offset-4 hover:underline">
                  {miga.etiqueta}
                </Link>
              ) : (
                /* La página actual no es un enlace, y se marca como tal. */
                <span aria-current="page" className="text-foreground font-medium">
                  {miga.etiqueta}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  )
}
