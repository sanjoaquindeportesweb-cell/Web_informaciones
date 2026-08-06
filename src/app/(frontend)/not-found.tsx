import { Banderola, FondoHero } from '@/componentes/Banderola'
import { BotonEnlace } from '@/componentes/Boton'
import { Buscador } from '@/componentes/Buscador'

/**
 * 404. Con la banderola, como pide el sistema, y con el buscador a mano:
 * quien llega aquí venía buscando algo puntual, no a leer un mensaje de
 * error — la salida más útil es ayudarlo a encontrarlo.
 */
export default function NoEncontrado() {
  return (
    <section className="relative isolate overflow-hidden">
      <FondoHero />
      <div className="shell relative py-24 md:py-32">
        <p className="text-violeta-sobre text-[11px] font-bold tracking-[0.14em] uppercase">
          Error 404
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-[32px] leading-[1.05] font-black text-white md:text-[48px]">
          No encontramos esta página
        </h1>
        <p className="text-violeta-sobre mt-4 max-w-xl text-lg">
          Puede que la dirección esté mal escrita o que la página se haya movido. Prueba
          buscando lo que necesitas.
        </p>
        <div className="mt-8 max-w-md">
          <Buscador sobreVioleta />
        </div>
        <BotonEnlace href="/" variante="sobreVioleta" className="mt-6">
          Volver al inicio
        </BotonEnlace>
      </div>
      <Banderola className="h-14" />
    </section>
  )
}
