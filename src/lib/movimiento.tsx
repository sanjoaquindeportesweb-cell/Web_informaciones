'use client'

import { LazyMotion, domAnimation, m, useReducedMotion, type Transition } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Capa de movimiento del portal.
 *
 * Tres decisiones que la gobiernan:
 *
 * 1. **`LazyMotion` con `domAnimation` y componentes `m.*`**, no `motion.*`. La
 *    versión completa son unos 34 kB; así queda en torno a 15 kB. En un portal
 *    municipal que se consulta con datos móviles eso importa más que la
 *    comodidad de escribir `motion.div`.
 *
 * 2. **Las duraciones y curvas salen de los tokens**, no de los valores por
 *    defecto de la librería. Si el movimiento del sitio se ajusta, se ajusta en
 *    globals.css y aquí no se toca nada.
 *
 * 3. **`useReducedMotion` en cada componente animado.** No basta con quitar la
 *    animación: hay que entregar el estado final, visible y quieto. Una
 *    animación desactivada que deja el elemento en `opacity: 0` es peor que no
 *    haberla puesto.
 */

/* Los tokens del sistema, en segundos y como curvas de Bézier. Duplicados aquí
   porque la librería necesita números, no cadenas CSS; el comentario es el que
   evita que se separen del CSS sin que nadie se dé cuenta. */
const RAPIDA = 0.15
const MEDIA = 0.3
const LENTA = 0.45
const ENTRADA: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SALIDA: [number, number, number, number] = [0.4, 0, 1, 1]
const DESFASE = 0.04

export const transicion = {
  rapida: { duration: RAPIDA, ease: SALIDA } satisfies Transition,
  media: { duration: MEDIA, ease: ENTRADA } satisfies Transition,
  lenta: { duration: LENTA, ease: ENTRADA } satisfies Transition,
}

export { m, useReducedMotion }

/** Envoltorio que carga las funciones de animación una sola vez. */
export const ProveedorMovimiento = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
)

/* --- Aparición al entrar en pantalla --------------------------------------- */

/**
 * Revela su contenido al entrar en el viewport. `once` está puesto a propósito:
 * un elemento que se vuelve a animar cada vez que se pasa por encima marea y
 * hace que la página se sienta inestable al desplazarse hacia atrás.
 */
export const Revelar = ({
  children,
  retraso = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  retraso?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'header' | 'article'
}) => {
  const menos = useReducedMotion()
  const Etiqueta = m[as]

  /* Con movimiento reducido se pinta el mismo elemento, quieto: cambiar de
     `<header>` a `<div>` aquí le quita el landmark a quien no ve ninguna
     animación de todos modos. */
  if (menos) {
    const Plano = as
    return <Plano className={className}>{children}</Plano>
  }

  return (
    <Etiqueta
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...transicion.lenta, delay: retraso }}
    >
      {children}
    </Etiqueta>
  )
}

/** Variantes para escalonar una lista o una cuadrícula. */
export const listaEscalonada = {
  oculto: {},
  visible: { transition: { staggerChildren: DESFASE } },
}

export const itemEscalonado = {
  oculto: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: transicion.lenta },
}

/**
 * Cuadrícula o lista que revela sus hijos directos con un desfase de 40ms
 * entre uno y otro. Cada hijo debe ser un elemento propio (una tarjeta, un
 * `<li>`): el desfase se aplica por hijo directo, no por palabra ni por letra.
 */
export const ListaEscalonada = ({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'ul'
}) => {
  const menos = useReducedMotion()

  if (menos) {
    const Plano = as
    return <Plano className={className}>{children}</Plano>
  }

  /* `m.div` no acepta un prop `as`: cada componente de motion está atado a su
     propia etiqueta, así que la lista y sus ítems se eligen aquí. */
  const Envoltura = as === 'ul' ? m.ul : m.div
  const Item = as === 'ul' ? m.li : m.div

  return (
    <Envoltura
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={listaEscalonada}
    >
      {Array.isArray(children)
        ? children.map((hijo, i) => (
            <Item key={i} variants={itemEscalonado}>
              {hijo}
            </Item>
          ))
        : children}
    </Envoltura>
  )
}

/* --- Titulares -------------------------------------------------------------- */

/**
 * Titular que entra palabra por palabra.
 *
 * Se parte por palabras y no por letras: por letras, un lector de pantalla
 * puede llegar a deletrear el titular, y en un texto largo el escalonado se
 * vuelve interminable. Además el texto completo va en un `sr-only` y los
 * fragmentos quedan ocultos para la accesibilidad, de modo que el titular se
 * anuncia como una sola frase.
 */
export const TituloAnimado = ({
  texto,
  className,
  como: Como = 'h1',
}: {
  texto: string
  className?: string
  como?: 'h1' | 'h2'
}) => {
  const menos = useReducedMotion()

  if (menos) return <Como className={className}>{texto}</Como>

  return (
    <Como className={className}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">
        {texto.split(' ').map((palabra, i) => (
          <span key={`${palabra}-${i}`} className="inline-block overflow-hidden align-bottom">
            <m.span
              className="inline-block"
              initial={{ opacity: 0, y: '0.5em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transicion.lenta, delay: i * DESFASE }}
            >
              {palabra}
              {/* Espacio dentro del bloque: si va fuera, el navegador lo
                  colapsa y las palabras se pegan. */}
              {' '}
            </m.span>
          </span>
        ))}
      </span>
    </Como>
  )
}

/* --- Interacción ------------------------------------------------------------ */

/** Presión de un control: se hunde un poco y vuelve. */
export const presion = { scale: 0.97 }

/** Elevación de una tarjeta al pasar por encima. */
export const elevacion = { y: -4 }
