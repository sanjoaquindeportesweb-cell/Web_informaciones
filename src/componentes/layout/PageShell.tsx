import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { FiloBanderola } from '@/componentes/Banderola'
import {
  IconoCorreo,
  IconoEnlaceExterno,
  IconoTelefono,
  IconoUbicacion,
  MARCAS_SOCIALES,
  type ClaveRed,
} from '@/componentes/Iconos'
import { SelloCorporacion } from '@/componentes/SelloCorporacion'
import { URL_TALLERES } from '@/constantes/enlaces-externos'
import type { ItemNavegacion } from '@/tipos'
import { Cabecera } from './Cabecera'
import { ControlTexto } from './ControlTexto'

/**
 * Armazón del portal: barra de utilidad, cabecera, contenido y pie.
 *
 * Todo lo que aquí aparece como valor por defecto vendrá de los globales de
 * Payload (`navegacion`, `pie-de-pagina`, `ajustes-del-sitio`). Los datos de
 * contacto van con marcador evidente hasta que la Corporación entregue los
 * reales: inventar un teléfono municipal es peor que dejarlo en blanco, porque
 * alguien lo va a marcar.
 */

export type DatosSitio = {
  navegacion: ItemNavegacion[]
  direccion: string
  telefono: string
  correo: string
  redes: Partial<Record<ClaveRed, string>>
  enlacesLegales: ItemNavegacion[]
}

export const SITIO_DEMO: DatosSitio = {
  navegacion: [
    { etiqueta: 'Noticias', href: '/noticias' },
    { etiqueta: 'Recintos', href: '/recintos' },
    { etiqueta: 'Galerías', href: '/galerias' },
    { etiqueta: 'Talleres', href: URL_TALLERES, externo: true },
    { etiqueta: 'Contacto', href: '/contacto' },
  ],
  direccion: '[dirección por confirmar], San Joaquín',
  telefono: '[teléfono por confirmar]',
  correo: '[correo por confirmar]',
  redes: {
    facebook: 'https://www.facebook.com/sanjoaquindeportes/',
    instagram: 'https://www.instagram.com/deportessanjoaquin/',
  },
  enlacesLegales: [
    { etiqueta: 'Transparencia', href: '/transparencia' },
    { etiqueta: 'Ley del Lobby', href: '/ley-de-lobby' },
    { etiqueta: 'Privacidad', href: '/privacidad' },
  ],
}

/**
 * Enlace de la barra superior.
 *
 * Transparencia y Ley del Lobby suelen vivir en el portal del municipio, no
 * acá: cuando el editor marca «Sale del portal», el enlace se abre en otra
 * pestaña y lo dice —icono y nombre accesible—, igual que el ítem de Talleres
 * en el menú principal. Antes esos enlaces solo podían ser internos, así que
 * apuntar afuera significaba sacar al vecino del portal sin avisarle.
 */
const EnlaceUtilidad = ({
  enlace,
  className,
}: {
  enlace: ItemNavegacion
  className?: string
}) => {
  const clases = cn(
    'hover:text-violeta-activo inline-flex min-h-8 items-center gap-1 underline-offset-4 hover:underline',
    className,
  )

  if (enlace.externo) {
    return (
      <a
        href={enlace.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${enlace.etiqueta} (se abre en otra ventana)`}
        className={clases}
      >
        {enlace.etiqueta}
        <IconoEnlaceExterno className="text-[0.9em] opacity-75" />
      </a>
    )
  }

  return (
    <Link href={enlace.href} className={clases}>
      {enlace.etiqueta}
    </Link>
  )
}

export const PageShell = ({
  children,
  sitio = SITIO_DEMO,
}: {
  children: ReactNode
  sitio?: DatosSitio
}) => (
  <div className="flex min-h-dvh flex-col">
    {/* Primer elemento enfocable de la página. Sin esto, llegar al contenido
        con teclado obliga a recorrer el menú entero en cada página. */}
    <a
      href="#contenido"
      className="sr-only-focusable bg-card text-foreground focus:ring-ring absolute top-2 left-2 z-50 rounded-[var(--radius-sm)] px-4 py-2 font-semibold focus:ring-3"
    >
      Saltar al contenido
    </a>

    <div className="bg-violeta-honda text-white">
      <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1 text-[13px]">
        <ul className="flex flex-wrap items-center gap-x-4">
          {sitio.enlacesLegales.map((e) => (
            <li key={e.href}>
              <EnlaceUtilidad enlace={e} />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ControlTexto />
          <ul className="flex items-center gap-1">
            {(Object.keys(sitio.redes) as ClaveRed[]).map((clave) => {
              const url = sitio.redes[clave]
              if (!url) return null
              const { etiqueta, Icono } = MARCAS_SOCIALES[clave]
              return (
                <li key={clave}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${etiqueta} de la Corporación (se abre en otra ventana)`}
                    className="grid h-8 w-8 place-items-center rounded hover:bg-white/15"
                  >
                    <Icono />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>

    <Cabecera navegacion={sitio.navegacion} />

    <main id="contenido" className="flex-1">
      {children}
    </main>

    <FiloBanderola />

    <footer className="bg-violeta-honda text-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <SelloCorporacion className="h-14 w-14 md:h-16 md:w-16" />
          <p className="text-violeta-sobre mt-4 max-w-sm">
            Corporación Municipal de Deportes de San Joaquín. Promovemos la actividad física y el
            deporte en la comuna.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">Contacto</h2>
          <ul className="text-violeta-sobre mt-3 grid gap-2 text-[15px]">
            <li className="flex items-start gap-2">
              <IconoUbicacion className="mt-0.5 shrink-0" />
              {sitio.direccion}
            </li>
            <li className="flex items-center gap-2">
              <IconoTelefono className="shrink-0" />
              <span className="tabular">{sitio.telefono}</span>
            </li>
            <li className="flex items-center gap-2">
              <IconoCorreo className="shrink-0" />
              {sitio.correo}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold">El portal</h2>
          <ul className="mt-3 grid gap-2 text-[15px]">
            {sitio.navegacion.map((item) => (
              <li key={item.href}>
                {/* El mismo componente que la barra superior: el ítem de
                    Talleres sale del portal y acá se pintaba como enlace
                    interno, sin pestaña nueva ni aviso. */}
                <EnlaceUtilidad enlace={item} className="text-violeta-sobre" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="shell text-violeta-sobre py-4 text-[13px]">
          © {new Date().getFullYear()} Corporación Municipal de Deportes de San Joaquín.
        </div>
      </div>
    </footer>
  </div>
)
