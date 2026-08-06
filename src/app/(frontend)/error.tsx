'use client'

import { useEffect } from 'react'

import { Banderola, FondoHero } from '@/componentes/Banderola'
import { Boton } from '@/componentes/Boton'

/**
 * Límite de error de la ruta. Tiene que ser de cliente: Next solo activa
 * `error.tsx` para errores capturados en el árbol de React del navegador.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="relative isolate overflow-hidden">
      <FondoHero />
      <div className="shell relative py-24 md:py-32">
        <p className="text-violeta-sobre text-[11px] font-bold tracking-[0.14em] uppercase">
          Error 500
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-[32px] leading-[1.05] font-black text-white md:text-[48px]">
          Algo falló de nuestro lado
        </h1>
        <p className="text-violeta-sobre mt-4 max-w-xl text-lg">
          No es nada que hayas hecho tú. Puedes intentarlo de nuevo en un momento.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Boton variante="sobreVioleta" onClick={reset}>
            Intentar de nuevo
          </Boton>
        </div>
      </div>
      <Banderola className="h-14" />
    </section>
  )
}
