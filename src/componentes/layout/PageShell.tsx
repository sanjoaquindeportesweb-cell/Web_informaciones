import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { FiloBanderola } from '@/componentes/Banderola'
import {
  IconoChevronAbajo,
  IconoCorreo,
  IconoEnlaceExterno,
  IconoTelefono,
  IconoUbicacion,
  MARCAS_SOCIALES,
  type ClaveRed,
} from '@/componentes/Iconos'
import { SelloCorporacion } from '@/componentes/SelloCorporacion'
import { URL_TALLERES } from '@/constantes/enlaces-externos'
import type { EnlaceLegal, ItemNavegacion } from '@/tipos'
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
  enlacesLegales: EnlaceLegal[]
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
  /*
    Los tres accesos legales, con las direcciones OFICIALES del municipio
    —organismo CM253 en el portal de transparencia—, no rutas internas que no
    existen. Son las mismas del subdominio de talleres: definirlas distintas en
    cada mitad sería garantizar que un día una apunte a un organismo y la otra
    a otro.
  */
  enlacesLegales: [
    {
      etiqueta: 'Plataforma',
      titulo: 'Ley de Lobby',
      href: 'https://www.leylobby.gob.cl/instituciones/CM253',
      externo: true,
    },
    {
      etiqueta: 'Solicitar información',
      titulo: 'Ley de Transparencia',
      href: 'https://www.portaltransparencia.cl/PortalPdT/ingreso-sai-v2?idOrg=6828',
      externo: true,
    },
    {
      etiqueta: 'Transparencia activa',
      titulo: 'Ley de Transparencia',
      href: 'https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=CM253',
      externo: true,
    },
  ],
}

/**
 * Enlace de la barra superior, en una línea o en dos.
 *
 * Transparencia y Ley del Lobby suelen vivir en el portal del municipio, no
 * acá: cuando el editor marca «Sale del portal», el enlace se abre en otra
 * pestaña y lo dice —icono y nombre accesible—, igual que el ítem de Talleres
 * en el menú principal. Antes esos enlaces solo podían ser internos, así que
 * apuntar afuera significaba sacar al vecino del portal sin avisarle.
 *
 * **Con `titulo` se parte en dos líneas: el trámite arriba en pequeño y la ley
 * abajo en negrita.** Es el formato institucional chileno y el que ya usa el
 * subdominio de talleres, y hay una razón por la que la negrita va abajo y no
 * arriba: dos de los tres accesos apuntan a la MISMA ley —«Ley de
 * Transparencia», una para solicitar información y otra para la transparencia
 * activa—, así que la línea que los distingue es la de arriba y la que los
 * agrupa es la de abajo. Poner la negrita en la etiqueta rompería esa lectura.
 *
 * En pantallas estrechas las dos líneas se juntan en una, separadas por un
 * punto medio: tres accesos de dos líneas empujarían la cabecera media pantalla
 * abajo en un teléfono, que es desde donde se conecta la mayoría.
 */
const EnlaceUtilidad = ({
  enlace,
  className,
}: {
  enlace: EnlaceLegal
  className?: string
}) => {
  const clases = cn(
    'hover:text-violeta-activo inline-flex min-h-8 items-center gap-1 underline-offset-4 hover:underline',
    /* Con dos líneas el objetivo táctil llega a los 44px del mínimo y gana
       caja propia: sin el relleno, el subrayado de hover uniría visualmente un
       acceso con el siguiente. */
    enlace.titulo &&
      'sm:-mx-2 sm:min-h-11 sm:flex-col sm:items-start sm:gap-0 sm:px-2 sm:py-1 sm:leading-tight',
    className,
  )

  /* El nombre accesible se arma con las dos líneas juntas: leídas por separado,
     «Solicitar información» y «Ley de Transparencia» no dicen a dónde llevan. */
  const nombre = enlace.titulo ? `${enlace.etiqueta} · ${enlace.titulo}` : enlace.etiqueta

  /*
    El icono de «se abre en otra ventana» viaja pegado a la segunda línea, no
    suelto detrás: en la disposición de dos líneas caería en una tercera, solo,
    sin nada que lo explique.
  */
  const icono = <IconoEnlaceExterno className="shrink-0 text-[0.9em] opacity-75" />

  const contenido = enlace.titulo ? (
    <>
      <span className="text-violeta-sobre after:px-1 after:content-['·'] sm:after:content-none">
        {enlace.etiqueta}
      </span>
      <span className="inline-flex items-center gap-1 font-semibold sm:text-[15px]">
        {enlace.titulo}
        {enlace.externo ? icono : null}
      </span>
    </>
  ) : (
    <>
      {enlace.etiqueta}
      {enlace.externo ? icono : null}
    </>
  )

  if (enlace.externo) {
    return (
      <a
        href={enlace.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${nombre} (se abre en otra ventana)`}
        className={clases}
      >
        {contenido}
      </a>
    )
  }

  return (
    <Link href={enlace.href} aria-label={enlace.titulo ? nombre : undefined} className={clases}>
      {contenido}
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
        {/*
          ── Los accesos legales, en dos formas ──────────────────────────────
          En escritorio, los tres en dos líneas. En teléfono, plegados tras un
          «Transparencia»: desplegados ocupaban 140px —el doble que antes—
          empujando la cabecera y la noticia principal fuera de la primera
          pantalla, y esta es una barra de utilidad, no el contenido.

          Es un `<details>` nativo y no un menú con estado: no necesita
          JavaScript en el cliente, el teclado y los lectores de pantalla ya
          saben abrirlo, y funciona aunque el bundle no haya cargado todavía.
        */}
        <ul className="hidden flex-wrap items-center gap-x-4 sm:flex sm:gap-x-6">
          {sitio.enlacesLegales.map((e) => (
            <li key={e.href}>
              <EnlaceUtilidad enlace={e} />
            </li>
          ))}
        </ul>

        <details className="group sm:hidden">
          <summary className="hover:text-violeta-activo marker:content-none flex min-h-11 cursor-pointer list-none items-center gap-1.5">
            Transparencia
            <IconoChevronAbajo className="transition-transform group-open:rotate-180" />
          </summary>
          <ul className="grid gap-y-1 pb-2">
            {sitio.enlacesLegales.map((e) => (
              <li key={e.href}>
                <EnlaceUtilidad enlace={e} />
              </li>
            ))}
          </ul>
        </details>

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
