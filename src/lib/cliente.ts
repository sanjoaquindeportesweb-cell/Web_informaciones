'use client'

import { useSyncExternalStore } from 'react'

/**
 * Utilidades para lo que solo existe en el navegador.
 *
 * Van con `useSyncExternalStore` y no con `useState` + `useEffect` a propósito.
 * Poner un `setState` dentro de un efecto para «leer el DOM al montar» provoca
 * un render en cascada —React lo marca como error— y además obliga a pintar un
 * estado falso durante un fotograma. `useSyncExternalStore` da directamente un
 * valor distinto en servidor y en cliente, sin render intermedio.
 */

const sinSuscripcion = () => () => {}

/** `false` en el servidor y en el primer render; `true` una vez hidratado. */
export const useMontado = (): boolean =>
  useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  )

/** `true` si la persona pidió menos movimiento en su sistema. */
export const useMenosMovimiento = (): boolean =>
  useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', avisar)
      return () => mq.removeEventListener('change', avisar)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )

/* --- Preferencia persistida ------------------------------------------------ */

const oyentes = new Set<() => void>()

const avisarATodos = () => oyentes.forEach((o) => o())

/**
 * Lee y escribe una preferencia en localStorage, notificando a quien la
 * observe. Se avisa a mano porque el evento `storage` del navegador solo
 * dispara en *otras* pestañas, nunca en la que hizo el cambio.
 */
export const usePreferencia = (
  clave: string,
  porDefecto: number,
): [number, (valor: number) => void] => {
  const valor = useSyncExternalStore(
    (avisar) => {
      oyentes.add(avisar)
      window.addEventListener('storage', avisar)
      return () => {
        oyentes.delete(avisar)
        window.removeEventListener('storage', avisar)
      }
    },
    () => {
      const guardado = Number(window.localStorage.getItem(clave))
      return Number.isFinite(guardado) && window.localStorage.getItem(clave) !== null
        ? guardado
        : porDefecto
    },
    () => porDefecto,
  )

  const establecer = (nuevo: number) => {
    window.localStorage.setItem(clave, String(nuevo))
    avisarATodos()
  }

  return [valor, establecer]
}
