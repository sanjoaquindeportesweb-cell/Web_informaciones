import type { Metadata } from 'next'
import Link from 'next/link'

import { Buscador } from '@/componentes/Buscador'
import { EstadoVacio } from '@/componentes/Estados'
import { IconoBuscar, IconoCalendario, IconoInfo, IconoUbicacion } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { buscar, type ResultadoBusqueda } from '@/payload/consultas'

export const metadata: Metadata = {
  title: 'Buscar',
  robots: { index: false },
}

const ETIQUETA_TIPO: Record<ResultadoBusqueda['tipo'], string> = {
  noticia: 'Noticia',
  recinto: 'Recinto',
  pagina: 'Página',
}

const ICONO_TIPO: Record<ResultadoBusqueda['tipo'], typeof IconoCalendario> = {
  noticia: IconoCalendario,
  recinto: IconoUbicacion,
  pagina: IconoInfo,
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function PaginaBuscar({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const resultados = q.trim() ? await buscar(q) : []

  return (
    <>
      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: 'Buscar' }]} />
        <h1 className="font-display mt-4 text-[32px] leading-[1.05] font-black md:text-[48px]">
          Buscar en el portal
        </h1>
        <div className="mt-6 max-w-xl">
          <Buscador />
        </div>
      </div>

      <div className="shell pb-16 md:pb-24">
        {!q.trim() ? (
          <EstadoVacio
            titulo="Escribe algo para buscar"
            descripcion="Puedes buscar noticias, recintos deportivos y páginas del portal."
            Icono={IconoBuscar}
          />
        ) : resultados.length === 0 ? (
          <EstadoVacio
            titulo={`Sin resultados para «${q}»`}
            descripcion="Prueba con otra palabra o revisa la ortografía."
            Icono={IconoBuscar}
          />
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              {resultados.length} resultado{resultados.length === 1 ? '' : 's'} para «{q}»
            </p>
            <ul className="grid gap-3">
              {resultados.map((r) => {
                const Icono = ICONO_TIPO[r.tipo]
                return (
                  <li key={`${r.tipo}-${r.href}`}>
                    <Link
                      href={r.href}
                      className="group border-border bg-card hover:border-acento flex items-start gap-3 rounded-[var(--radius)] border p-4 transition-colors duration-[var(--duracion-rapida)]"
                    >
                      <span className="bg-acento-suave text-acento mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                        <Icono />
                      </span>
                      <span className="min-w-0">
                        <span className="text-muted-foreground block text-[11px] font-bold tracking-[0.14em] uppercase">
                          {ETIQUETA_TIPO[r.tipo]}
                        </span>
                        <span className="font-display block font-bold">{r.titulo}</span>
                        {r.extracto ? (
                          <span className="text-muted-foreground line-clamp-1 block text-sm">
                            {r.extracto}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
