'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import { Buscador } from '@/componentes/Buscador'
import {
  IconoCerrar,
  IconoChevronAbajo,
  IconoEnlaceExterno,
  IconoMenu,
} from '@/componentes/Iconos'
import { SelloCorporacion } from '@/componentes/SelloCorporacion'
import { m, transicion, useReducedMotion } from '@/lib/movimiento'
import type { ItemNavegacion } from '@/tipos'

/**
 * Cabecera del portal, sobre el campo violeta.
 *
 * El menú sale de los datos, no del código: viene del global `navegacion` de
 * Payload. Es lo que hace cierto que el administrador pueda crear una página y
 * sumarla al menú sin tocar nada.
 *
 * Un ítem con sub-ítems se convierte en desplegable —panel en escritorio,
 * acordeón en el menú de bajo 1024px— siguiendo el patrón «disclosure
 * navigation» de la WAI: el disparador es un `button` con `aria-expanded`, no
 * un enlace. Un enlace que además abre un submenú deja al lector de pantalla
 * sin saber qué hace al activarlo, y con el dedo hace las dos cosas a la vez.
 *
 * Que el disparador sea un botón le quita su destino al ítem padre, y el padre
 * sí tiene uno (`href` es obligatorio en el panel). Se recupera como primera
 * opción del propio desplegable, «Ver …»: la página del padre sigue
 * alcanzable, con un solo objetivo táctil por fila y sin etiquetas repetidas.
 *
 * Bajo 1024px pasa a panel a pantalla completa con objetivos de 44px. El panel
 * cierra con Esc y bloquea el desplazamiento del fondo, que si no es lo que
 * hace que uno crea que la página se rompió.
 */

type ItemConHijos = ItemNavegacion & { hijos: ItemNavegacion[] }

/* La capa de datos ya omite `hijos` cuando queda vacío, pero el respaldo de
   demostración y cualquier otro origen podrían mandar `[]`. Una lista vacía es
   un enlace normal, no un desplegable que se abre en blanco. */
const tieneHijos = (item: ItemNavegacion): item is ItemConHijos =>
  Array.isArray(item.hijos) && item.hijos.length > 0

const conEnlacePropio = (item: ItemConHijos): ItemNavegacion[] => [
  { etiqueta: `Ver ${item.etiqueta}`, href: item.href, externo: item.externo },
  ...item.hijos,
]

export const Cabecera = ({ navegacion }: { navegacion: ItemNavegacion[] }) => {
  const [abierto, setAbierto] = useState(false)
  /* Dos estados y no uno compartido: el desplegable de escritorio se cierra al
     apuntar fuera del `nav`, y el acordeón del panel móvil vive fuera de ese
     `nav`. Con un solo estado, cada toque en el acordeón entraba por el
     detector de «clic fuera» y lo cerraba antes de que el botón lo abriera. */
  const [submenuEscritorio, setSubmenuEscritorio] = useState<string | null>(null)
  const [submenuMovil, setSubmenuMovil] = useState<string | null>(null)
  const [desplazado, setDesplazado] = useState(false)
  const ruta = usePathname()
  const [rutaDelMenu, setRutaDelMenu] = useState(ruta)
  const menos = useReducedMotion()
  const navEscritorio = useRef<HTMLElement | null>(null)

  const activa = (href: string) => ruta === href || (href !== '/' && ruta.startsWith(`${href}/`))

  /* Un padre se marca activo también cuando la página actual es uno de sus
     hijos: si no, entrar a un sub-ítem apaga la única pista de dónde está uno
     dentro del menú. */
  const activaConHijos = (item: ItemNavegacion) =>
    activa(item.href) || (item.hijos ?? []).some((hijo) => activa(hijo.href))

  /* Cerrar el menú al navegar se ajusta **durante el render**, no en un
     efecto: con un efecto el panel alcanza a pintarse una vez sobre la página
     nueva antes de desaparecer. Es el patrón que React documenta para derivar
     estado de un cambio de props. */
  if (ruta !== rutaDelMenu) {
    setRutaDelMenu(ruta)
    setAbierto(false)
    setSubmenuEscritorio(null)
    setSubmenuMovil(null)
  }

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 8)
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  useEffect(() => {
    if (!abierto) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [abierto])

  /* Escape cierra de dentro hacia fuera: primero el sub-nivel abierto y solo
     después el panel. Cerrando los dos de una, salir de un submenú en el
     celular se llevaba el menú completo. */
  useEffect(() => {
    if (!abierto && !submenuEscritorio && !submenuMovil) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (submenuEscritorio) setSubmenuEscritorio(null)
      else if (submenuMovil) setSubmenuMovil(null)
      else setAbierto(false)
    }
    document.addEventListener('keydown', alTeclado)
    return () => document.removeEventListener('keydown', alTeclado)
  }, [abierto, submenuEscritorio, submenuMovil])

  useEffect(() => {
    if (!submenuEscritorio) return
    const alApuntar = (e: PointerEvent) => {
      if (e.target instanceof Node && navEscritorio.current?.contains(e.target)) return
      setSubmenuEscritorio(null)
    }
    document.addEventListener('pointerdown', alApuntar)
    return () => document.removeEventListener('pointerdown', alApuntar)
  }, [submenuEscritorio])

  const alternarPanel = () => {
    const siguiente = !abierto
    setAbierto(siguiente)
    /* Abrir el menú estando dentro de un sub-ítem despliega su acordeón: el
       ítem activo tiene que estar a la vista, no escondido tras un toque. */
    setSubmenuMovil(
      siguiente ? (navegacion.find((i) => tieneHijos(i) && activaConHijos(i))?.href ?? null) : null,
    )
  }

  return (
    <header
      className={cn(
        'bg-violeta sticky top-0 z-40 text-white',
        'transition-shadow duration-[var(--duracion-rapida)]',
        desplazado && 'shadow-lg backdrop-blur',
      )}
    >
      <div className="shell flex min-h-16 items-center gap-4 py-2">
        <Link href="/" className="shrink-0" aria-label="Ir al inicio del portal">
          <SelloCorporacion />
        </Link>

        <nav ref={navEscritorio} aria-label="Navegación principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {navegacion.map((item, indice) =>
              tieneHijos(item) ? (
                <li
                  key={item.href}
                  className="relative"
                  /* Tabular fuera del desplegable lo cierra. Sin esto, el panel
                     se queda abierto sobre la página mientras el foco ya está
                     tres ítems más allá. */
                  onBlur={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
                    setSubmenuEscritorio((actual) => (actual === item.href ? null : actual))
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={submenuEscritorio === item.href}
                    aria-controls={`submenu-escritorio-${indice}`}
                    onClick={() =>
                      setSubmenuEscritorio((actual) => (actual === item.href ? null : item.href))
                    }
                    className={cn(clasesNivelUno(activaConHijos(item)), 'cursor-pointer')}
                  >
                    {item.etiqueta}
                    <IconoChevronAbajo
                      className={cn(
                        'text-[0.8em] motion-safe:transition-transform motion-safe:duration-[var(--duracion-rapida)]',
                        submenuEscritorio === item.href && 'rotate-180',
                      )}
                    />
                  </button>

                  {submenuEscritorio === item.href ? (
                    <ul
                      id={`submenu-escritorio-${indice}`}
                      className="bg-violeta-honda absolute top-full left-0 z-50 mt-1 grid min-w-60 gap-0.5 rounded-[var(--radius-sm)] border border-white/15 p-1 shadow-lg"
                    >
                      {conEnlacePropio(item).map((hijo) => (
                        <li key={`${hijo.etiqueta}-${hijo.href}`}>
                          <Enlace
                            item={hijo}
                            activa={activa(hijo.href)}
                            className={clasesSubitem(activa(hijo.href))}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ) : (
                <li key={item.href}>
                  <Enlace
                    item={item}
                    activa={activa(item.href)}
                    className={clasesNivelUno(activa(item.href))}
                  />
                </li>
              ),
            )}
          </ul>
        </nav>

        <Buscador sobreVioleta className="ml-auto hidden w-64 lg:ml-4 lg:block" />

        <button
          type="button"
          onClick={alternarPanel}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          className="toque ml-auto grid cursor-pointer place-items-center rounded-[var(--radius-sm)] hover:bg-white/15 lg:hidden"
        >
          {abierto ? <IconoCerrar /> : <IconoMenu />}
          <span className="sr-only">{abierto ? 'Cerrar el menú' : 'Abrir el menú'}</span>
        </button>
      </div>

      <AnimatePresence>
        {abierto ? (
          <m.div
            id="menu-movil"
            className="bg-violeta overflow-hidden border-t border-white/15 lg:hidden"
            initial={menos ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={menos ? undefined : { opacity: 0, y: -8 }}
            transition={transicion.rapida}
          >
            <div className="shell py-4">
              <Buscador sobreVioleta className="mb-4" />
              <nav aria-label="Navegación principal">
                <ul className="grid gap-1">
                  {navegacion.map((item, indice) =>
                    tieneHijos(item) ? (
                      <li key={item.href}>
                        <button
                          type="button"
                          aria-expanded={submenuMovil === item.href}
                          aria-controls={`submenu-movil-${indice}`}
                          onClick={() =>
                            setSubmenuMovil((actual) => (actual === item.href ? null : item.href))
                          }
                          className={cn(
                            clasesNivelUno(activaConHijos(item)),
                            'w-full cursor-pointer text-lg',
                          )}
                        >
                          {item.etiqueta}
                          <IconoChevronAbajo
                            className={cn(
                              'ml-auto motion-safe:transition-transform motion-safe:duration-[var(--duracion-rapida)]',
                              submenuMovil === item.href && 'rotate-180',
                            )}
                          />
                        </button>

                        {submenuMovil === item.href ? (
                          <ul
                            id={`submenu-movil-${indice}`}
                            className="mt-1 ml-3 grid gap-0.5 border-l border-white/20 pl-3"
                          >
                            {conEnlacePropio(item).map((hijo) => (
                              <li key={`${hijo.etiqueta}-${hijo.href}`}>
                                <Enlace
                                  item={hijo}
                                  activa={activa(hijo.href)}
                                  className={cn(clasesSubitem(activa(hijo.href)), 'w-full')}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ) : (
                      <li key={item.href}>
                        <Enlace
                          item={item}
                          activa={activa(item.href)}
                          className={cn(clasesNivelUno(activa(item.href)), 'w-full text-lg')}
                        />
                      </li>
                    ),
                  )}
                </ul>
              </nav>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

const clasesNivelUno = (activa: boolean) =>
  cn(
    'toque flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 font-semibold',
    'transition-colors duration-[var(--duracion-rapida)] hover:bg-white/15',
    /* El ítem activo no se marca solo con color: lleva subrayado y
       aria-current, porque --violeta-activo sobre el violeta da 6,59:1 pero
       sigue siendo «solo color». */
    activa && 'text-violeta-activo underline decoration-2 underline-offset-8',
  )

/* Dentro del desplegable el subrayado permanente competiría con el del padre y
   con el del ítem activo de primer nivel; acá la pista del activo es el fondo
   sostenido más el color, y `aria-current` sigue puesto en el enlace. */
const clasesSubitem = (activa: boolean) =>
  cn(
    'toque flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 font-medium',
    'transition-colors duration-[var(--duracion-rapida)] hover:bg-white/15',
    activa ? 'text-violeta-activo bg-white/10' : 'text-violeta-sobre',
  )

const Enlace = ({
  item,
  activa,
  className,
}: {
  item: ItemNavegacion
  activa: boolean
  className: string
}) => {
  if (item.externo) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.etiqueta} (se abre en otra ventana)`}
        className={className}
      >
        {item.etiqueta}
        <IconoEnlaceExterno className="text-[0.85em] opacity-75" />
      </a>
    )
  }

  return (
    <Link href={item.href} aria-current={activa ? 'page' : undefined} className={className}>
      {item.etiqueta}
    </Link>
  )
}
