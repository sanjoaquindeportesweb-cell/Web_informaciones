import Link from 'next/link'

import { CLAVES_CATEGORIA, categoriaDe } from '@/componentes/categorias'
import { EstadoVacio } from '@/componentes/Estados'
import { IconoCalendario } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { TarjetaNoticia } from '@/componentes/TarjetaNoticia'
import { cn } from '@/lib/cn'
import { ListaEscalonada } from '@/lib/movimiento'
import { metadatosDeListado } from '@/lib/seo'
import { listarNoticias } from '@/payload/consultas'

export const metadata = metadatosDeListado(
  'Noticias',
  'Noticias e informaciones de la Corporación Municipal de Deportes de San Joaquín.',
)

type Props = {
  searchParams: Promise<{ categoria?: string; pagina?: string }>
}

export default async function PaginaNoticias({ searchParams }: Props) {
  const { categoria, pagina: paginaTexto } = await searchParams
  const pagina = Math.max(1, Number(paginaTexto) || 1)

  const { noticias, totalPaginas, paginaActual } = await listarNoticias({ categoria, pagina })

  return (
    <>
      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: 'Noticias' }]} />
        <h1 className="font-display mt-4 text-[40px] leading-[1.02] font-black md:text-[56px]">
          Noticias
        </h1>
      </div>

      <div className="shell pb-16 md:pb-24">
        <nav aria-label="Filtrar por categoría" className="mb-8 flex flex-wrap gap-2">
          <FiltroCategoria etiqueta="Todas" href="/noticias" activo={!categoria} />
          {CLAVES_CATEGORIA.map((clave) => (
            <FiltroCategoria
              key={clave}
              etiqueta={categoriaDe(clave).etiqueta}
              href={`/noticias?categoria=${clave}`}
              activo={categoria === clave}
            />
          ))}
        </nav>

        {noticias.length === 0 ? (
          <EstadoVacio
            titulo="No hay noticias en esta categoría"
            descripcion="Prueba con otra categoría o revisa todas las noticias publicadas."
            Icono={IconoCalendario}
            accion={
              <Link href="/noticias" className="text-primary font-semibold">
                Ver todas las noticias
              </Link>
            }
          />
        ) : (
          <ListaEscalonada className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <TarjetaNoticia key={n.slug} noticia={n} />
            ))}
          </ListaEscalonada>
        )}

        {totalPaginas > 1 ? (
          <nav aria-label="Paginación" className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/noticias?${new URLSearchParams({
                  ...(categoria ? { categoria } : {}),
                  pagina: String(n),
                }).toString()}`}
                aria-current={n === paginaActual ? 'page' : undefined}
                className={cn(
                  'toque grid min-w-11 place-items-center rounded-[var(--radius-sm)] font-semibold',
                  n === paginaActual
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground',
                )}
              >
                {n}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </>
  )
}

const FiltroCategoria = ({
  etiqueta,
  href,
  activo,
}: {
  etiqueta: string
  href: string
  activo: boolean
}) => (
  <Link
    href={href}
    aria-current={activo ? 'true' : undefined}
    className={cn(
      'toque inline-flex items-center rounded-full px-4 text-sm font-semibold transition-colors duration-[var(--duracion-rapida)]',
      activo ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-border',
    )}
  >
    {etiqueta}
  </Link>
)
