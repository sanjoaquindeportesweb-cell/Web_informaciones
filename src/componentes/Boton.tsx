import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { IconoEnlaceExterno } from './Iconos'

/**
 * Botón del sistema.
 *
 * Cuatro variantes y nada más. La de `sobreVioleta` existe porque encima del
 * campo violeta no puede ir el naranja: da 3,05:1 y sería ilegible; ahí el
 * botón se invierte a blanco con texto violeta.
 *
 * Altura mínima 44px en todos los tamaños, incluido `sm`: el público del
 * portal es mayoritariamente adulto mayor y el sitio se usa desde el teléfono.
 */

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'sobreVioleta'
export type TamanoBoton = 'sm' | 'md' | 'lg'

const VARIANTES: Record<VarianteBoton, string> = {
  /* --primary es el naranja accesible (#BD5200), no el institucional: lleva
     texto blanco encima y necesita 4,5:1. */
  primario:
    'bg-primary text-primary-foreground hover:bg-naranja-700 active:bg-naranja-800 shadow-sm',
  secundario:
    'border border-border bg-card text-foreground hover:bg-muted active:bg-secondary',
  fantasma: 'text-foreground hover:bg-muted active:bg-secondary',
  sobreVioleta: 'bg-white text-violeta hover:bg-violeta-50 active:bg-violeta-activo shadow-sm',
}

const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'min-h-11 px-4 text-sm gap-1.5',
  md: 'min-h-11 px-5 text-base gap-2',
  lg: 'min-h-13 px-7 text-lg gap-2.5',
}

const BASE = [
  'inline-flex items-center justify-center rounded-[var(--radius)] font-semibold',
  'cursor-pointer touch-manipulation select-none',
  'transition-[background-color,color,box-shadow,transform] duration-[var(--duracion-rapida)] ease-[var(--curva-salida)]',
  /* La presión se hunde un poco y vuelve. Va en CSS y no con `motion` a
     propósito: es una respuesta directa a `:active`, no una animación que se
     dispara sola, así que no hace falta convertir cada botón del sitio en un
     componente de cliente solo para esto. */
  'active:scale-[0.97] motion-reduce:active:scale-100',
  'disabled:pointer-events-none disabled:opacity-45',
].join(' ')

type Comunes = {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  anchoCompleto?: boolean
  children: ReactNode
}

type PropsBoton = Comunes &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    cargando?: boolean
    textoCargando?: string
  }

type PropsEnlace = Comunes &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> & {
    href: string
    /** Marca el enlace como saliente: icono, target y aviso al lector de pantalla. */
    externo?: boolean
  }

const clases = (
  { variante = 'primario', tamano = 'md', anchoCompleto }: Comunes,
  extra?: string,
) => cn(BASE, VARIANTES[variante], TAMANOS[tamano], anchoCompleto && 'w-full', extra)

export const Boton = ({
  variante,
  tamano,
  anchoCompleto,
  cargando = false,
  textoCargando = 'Enviando…',
  children,
  className,
  disabled,
  ...props
}: PropsBoton) => (
  <button
    type="button"
    /* Deshabilitado mientras carga: sin esto un doble clic manda el formulario
       dos veces, que en un formulario público pasa constantemente. */
    disabled={disabled || cargando}
    aria-busy={cargando || undefined}
    className={clases({ variante, tamano, anchoCompleto, children }, className)}
    {...props}
  >
    {cargando ? (
      <>
        <Girador />
        {textoCargando}
      </>
    ) : (
      children
    )}
  </button>
)

/**
 * Mismo botón, pero es un enlace. Se separa del `<button>` a propósito: un
 * enlace disfrazado de botón rompe abrir en pestaña nueva y el menú
 * contextual, y un botón que navega deja al teclado sin `Enter`.
 */
export const BotonEnlace = ({
  variante,
  tamano,
  anchoCompleto,
  externo = false,
  href,
  children,
  className,
  ...props
}: PropsEnlace) => {
  const contenido = (
    <>
      {children}
      {externo ? <IconoEnlaceExterno className="opacity-70" /> : null}
    </>
  )

  const comunes = {
    className: clases({ variante, tamano, anchoCompleto, children }, className),
    ...props,
  }

  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        /* Se dice que abre en otra ventana: para quien usa lector de pantalla,
           un cambio de contexto sin aviso es desorientador. */
        aria-label={`${typeof children === 'string' ? children : 'Enlace'} (se abre en otra ventana)`}
        {...comunes}
      >
        {contenido}
      </a>
    )
  }

  return (
    <Link href={href} {...comunes}>
      {contenido}
    </Link>
  )
}

const Girador = () => (
  <svg
    viewBox="0 0 24 24"
    width="1.15em"
    height="1.15em"
    fill="none"
    aria-hidden="true"
    className="motion-safe:animate-spin"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)
