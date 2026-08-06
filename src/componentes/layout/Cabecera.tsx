'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import { Buscador } from '@/componentes/Buscador'
import { IconoCerrar, IconoEnlaceExterno, IconoMenu } from '@/componentes/Iconos'
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
 * Bajo 1024px pasa a panel a pantalla completa con objetivos de 44px. El panel
 * cierra con Esc y bloquea el desplazamiento del fondo, que si no es lo que
 * hace que uno crea que la página se rompió.
 */

export const Cabecera = ({ navegacion }: { navegacion: ItemNavegacion[] }) => {
  const [abierto, setAbierto] = useState(false)
  const [desplazado, setDesplazado] = useState(false)
  const ruta = usePathname()
  const [rutaDelMenu, setRutaDelMenu] = useState(ruta)
  const menos = useReducedMotion()

  /* Cerrar el menú al navegar se ajusta **durante el render**, no en un
     efecto: con un efecto el panel alcanza a pintarse una vez sobre la página
     nueva antes de desaparecer. Es el patrón que React documenta para derivar
     estado de un cambio de props. */
  if (ruta !== rutaDelMenu) {
    setRutaDelMenu(ruta)
    setAbierto(false)
  }

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 8)
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  useEffect(() => {
    if (!abierto) return
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', alTeclado)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alTeclado)
      document.body.style.overflow = ''
    }
  }, [abierto])

  const activa = (href: string) => ruta === href || (href !== '/' && ruta.startsWith(`${href}/`))

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

        <nav aria-label="Navegación principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {navegacion.map((item) => (
              <li key={item.href}>
                <Enlace item={item} activa={activa(item.href)} />
              </li>
            ))}
          </ul>
        </nav>

        <Buscador sobreVioleta className="ml-auto hidden w-64 lg:ml-4 lg:block" />

        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
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
                  {navegacion.map((item) => (
                    <li key={item.href}>
                      <Enlace item={item} activa={activa(item.href)} ancho />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

const Enlace = ({
  item,
  activa,
  ancho = false,
}: {
  item: ItemNavegacion
  activa: boolean
  ancho?: boolean
}) => {
  const clases = cn(
    'toque flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 font-semibold',
    'transition-colors duration-[var(--duracion-rapida)] hover:bg-white/15',
    ancho ? 'w-full text-lg' : '',
    /* El ítem activo no se marca solo con color: lleva subrayado y
       aria-current, porque --violeta-activo sobre el violeta da 6,59:1 pero
       sigue siendo «solo color». */
    activa && 'text-violeta-activo underline decoration-2 underline-offset-8',
  )

  if (item.externo) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.etiqueta} (se abre en otra ventana)`}
        className={clases}
      >
        {item.etiqueta}
        <IconoEnlaceExterno className="text-[0.85em] opacity-75" />
      </a>
    )
  }

  return (
    <Link href={item.href} aria-current={activa ? 'page' : undefined} className={clases}>
      {item.etiqueta}
    </Link>
  )
}
