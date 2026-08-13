/**
 * Iconos del portal, dibujados a mano.
 *
 * El proyecto no lleva librería de iconos: son 20 glifos y una dependencia
 * entera para eso pesa más que el ahorro. Todos comparten la misma rejilla de
 * 24, el mismo grosor de trazo (1.75) y `currentColor`, que es lo que hace que
 * un icono herede la tinta de su categoría sin recolorearlo a mano.
 *
 * Van con `aria-hidden` por defecto: el icono acompaña a un texto, nunca lo
 * sustituye. Cuando de verdad va solo, el botón que lo contiene lleva el
 * `aria-label`.
 */

import type { SVGProps } from 'react'

export type PropsIcono = SVGProps<SVGSVGElement> & { titulo?: string }

const Base = ({ titulo, children, ...props }: PropsIcono & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    width="1.25em"
    height="1.25em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={titulo ? undefined : true}
    role={titulo ? 'img' : undefined}
    focusable="false"
    {...props}
  >
    {titulo ? <title>{titulo}</title> : null}
    {children}
  </svg>
)

export const IconoFlecha = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
)

export const IconoEnlaceExterno = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M14 5h5v5M19 5l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Base>
)

export const IconoBuscar = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Base>
)

export const IconoMenu = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
)

export const IconoCerrar = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)

export const IconoChevronIzq = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Base>
)

export const IconoChevronDer = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M9 5l7 7-7 7" />
  </Base>
)

export const IconoChevronAbajo = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M5 9l7 7 7-7" />
  </Base>
)

export const IconoReloj = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
)

export const IconoUbicacion = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
)

export const IconoTelefono = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M6 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z" />
  </Base>
)

export const IconoCorreo = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </Base>
)

export const IconoCalendario = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
  </Base>
)

export const IconoReproducir = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10.5 9l5 3-5 3V9Z" fill="currentColor" />
  </Base>
)

export const IconoImagen = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M4 17l4.5-4.5 3.5 3.5 3-3L20 17" />
  </Base>
)

export const IconoAlerta = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 4.5 21 19H3L12 4.5Z" />
    <path d="M12 10v4M12 16.5v.01" />
  </Base>
)

export const IconoCheck = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M5 12.5 10 17.5 19 7" />
  </Base>
)

export const IconoInfo = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.5v.01" />
  </Base>
)

export const IconoBalon = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m12 7.5 3.8 2.8-1.5 4.5h-4.6L8.2 10.3 12 7.5ZM12 3.5v4M4.2 9.8l3.8.6M19.8 9.8l-3.8.6M7.4 19.3l2.3-3.5M16.6 19.3l-2.3-3.5" />
  </Base>
)

export const IconoMascara = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 8.5c2.5-1.5 5-1.5 8 0s5.5 1.5 8 0M4 8.5v3c0 4.5 3.6 8 8 8s8-3.5 8-8v-3" />
  </Base>
)

export const IconoPaleta = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.8-.9 1.8-1.8 0-1.6 1-2.2 2.2-2.2h1.5a3 3 0 0 0 3-3c0-5.5-4-10-8.5-10Z" />
    <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </Base>
)

/* --- Iconos elegibles desde el panel ---------------------------------------
   Los accesos rápidos de la portada se editan en el global «Portada», y ahí
   el icono se elige de una lista. Un componente de React no cabe en un campo
   de Payload, así que lo que se guarda es la clave y este registro la traduce.

   Es la fuente única de las dos mitades: las opciones del `select` salen de
   aquí y el componente que pinta también. Escribir la lista dos veces —una en
   el global, otra en la portada— es cómo se llega a que el panel ofrezca un
   icono que el sitio no sabe dibujar. */

export const ICONOS_ACCESO = {
  balon: { etiqueta: 'Balón', Icono: IconoBalon },
  ubicacion: { etiqueta: 'Ubicación', Icono: IconoUbicacion },
  calendario: { etiqueta: 'Calendario', Icono: IconoCalendario },
  telefono: { etiqueta: 'Teléfono', Icono: IconoTelefono },
  correo: { etiqueta: 'Correo', Icono: IconoCorreo },
  reloj: { etiqueta: 'Reloj', Icono: IconoReloj },
  imagen: { etiqueta: 'Imagen', Icono: IconoImagen },
  info: { etiqueta: 'Información', Icono: IconoInfo },
  buscar: { etiqueta: 'Lupa', Icono: IconoBuscar },
} as const

export type ClaveIconoAcceso = keyof typeof ICONOS_ACCESO

/** Opciones para el `select` del panel, en el orden de arriba. */
export const OPCIONES_ICONO_ACCESO = (
  Object.entries(ICONOS_ACCESO) as [ClaveIconoAcceso, { etiqueta: string }][]
).map(([value, { etiqueta }]) => ({ value, label: etiqueta }))

/* --- Redes sociales -------------------------------------------------------
   Van rellenas y sin trazo: son marcas ajenas y hay que dibujarlas como son,
   no como el resto del set. */

const Marca = ({ titulo, children, ...props }: PropsIcono & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    width="1.25em"
    height="1.25em"
    fill="currentColor"
    stroke="none"
    aria-hidden={titulo ? undefined : true}
    role={titulo ? 'img' : undefined}
    focusable="false"
    {...props}
  >
    {titulo ? <title>{titulo}</title> : null}
    {children}
  </svg>
)

export const IconoFacebook = (p: PropsIcono) => (
  <Marca {...p}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3 0-1.3-.13-2.45-.13-2.42 0-4.08 1.48-4.08 4.2v2.34H7.5V13h2.67v8h3.33Z" />
  </Marca>
)

export const IconoInstagram = (p: PropsIcono) => (
  <Marca {...p}>
    <path d="M12 3.6c2.73 0 3.06.01 4.14.06 1 .05 1.54.21 1.9.35.48.19.82.41 1.18.77.36.36.58.7.77 1.18.14.36.3.9.35 1.9.05 1.08.06 1.4.06 4.14s-.01 3.06-.06 4.14c-.05 1-.21 1.54-.35 1.9-.19.48-.41.82-.77 1.18-.36.36-.7.58-1.18.77-.36.14-.9.3-1.9.35-1.08.05-1.4.06-4.14.06s-3.06-.01-4.14-.06c-1-.05-1.54-.21-1.9-.35a3.3 3.3 0 0 1-1.18-.77 3.3 3.3 0 0 1-.77-1.18c-.14-.36-.3-.9-.35-1.9C3.61 15.06 3.6 14.73 3.6 12s.01-3.06.06-4.14c.05-1 .21-1.54.35-1.9.19-.48.41-.82.77-1.18.36-.36.7-.58 1.18-.77.36-.14.9-.3 1.9-.35C8.94 3.61 9.27 3.6 12 3.6Zm0 4.5a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8Zm0 6.43a2.53 2.53 0 1 1 0-5.06 2.53 2.53 0 0 1 0 5.06Zm4.97-6.59a.91.91 0 1 1-1.82 0 .91.91 0 0 1 1.82 0Z" />
  </Marca>
)

export const IconoYoutube = (p: PropsIcono) => (
  <Marca {...p}>
    <path d="M21.6 8.2s-.2-1.4-.8-2c-.75-.8-1.6-.8-2-.85C15.95 5.2 12 5.2 12 5.2h-.01s-3.94 0-6.79.15c-.4.05-1.25.05-2 .85-.6.6-.79 2-.79 2S2.2 9.85 2.2 11.5v1.55c0 1.65.2 3.3.2 3.3s.2 1.4.79 2c.75.8 1.74.77 2.19.85 1.6.15 6.62.2 6.62.2s3.95-.01 6.8-.16c.4-.05 1.25-.05 2-.85.6-.6.8-2 .8-2s.2-1.65.2-3.3V11.5c0-1.65-.2-3.3-.2-3.3ZM10.05 14.9V9.35l5.07 2.79-5.07 2.76Z" />
  </Marca>
)

export const IconoTiktok = (p: PropsIcono) => (
  <Marca {...p}>
    <path d="M16.5 2.5h-3.2v13.1a2.6 2.6 0 1 1-2.6-2.6c.28 0 .55.04.8.13v-3.3a5.9 5.9 0 1 0 5.1 5.85V9.1a6.5 6.5 0 0 0 3.9 1.28V7.1a3.4 3.4 0 0 1-2.5-1.15A3.6 3.6 0 0 1 16.5 2.5Z" />
  </Marca>
)

export const IconoX = (p: PropsIcono) => (
  <Marca {...p}>
    <path d="M17.2 3.5h2.9l-6.35 7.26L21.5 20.5h-5.9l-4.6-6.02-5.28 6.02H2.8l6.8-7.77L2.5 3.5h6.05l4.16 5.5 4.5-5.5Zm-1.02 15.2h1.6L7.9 5.2H6.18l10 13.5Z" />
  </Marca>
)

export const MARCAS_SOCIALES = {
  facebook: { etiqueta: 'Facebook', Icono: IconoFacebook },
  instagram: { etiqueta: 'Instagram', Icono: IconoInstagram },
  youtube: { etiqueta: 'YouTube', Icono: IconoYoutube },
  tiktok: { etiqueta: 'TikTok', Icono: IconoTiktok },
  x: { etiqueta: 'X', Icono: IconoX },
} as const

export type ClaveRed = keyof typeof MARCAS_SOCIALES

/**
 * El orden de aquí es el orden en que salen los íconos, y es también la lista
 * que la capa de datos recorre para saber qué redes leer del panel.
 *
 * Se deriva del objeto en vez de escribirse a mano porque antes eran dos
 * listas independientes: al sumar TikTok había que acordarse de tocar las
 * dos, y olvidar la segunda deja el campo visible en el panel guardando una
 * URL que el sitio nunca lee. Nadie revisa un ícono que no aparece.
 */
export const CLAVES_RED = Object.keys(MARCAS_SOCIALES) as ClaveRed[]
