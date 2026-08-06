import { AccesoDestacado } from '@/componentes/AccesoDestacado'
import { CarruselDestacados } from '@/componentes/CarruselDestacados'
import { EstadoVacio } from '@/componentes/Estados'
import { FichaRecinto } from '@/componentes/FichaRecinto'
import {
  IconoBalon,
  IconoCalendario,
  IconoInfo,
  IconoTelefono,
  IconoUbicacion,
} from '@/componentes/Iconos'
import { TarjetaNoticia } from '@/componentes/TarjetaNoticia'
import { ListaEscalonada, Revelar } from '@/lib/movimiento'
import { listarDestacadosVigentes, listarRecintos, listarNoticias } from '@/payload/consultas'
import Link from 'next/link'

/* Red de seguridad: si por lo que sea un hook de revalidación no dispara
   (Payload nunca llegó a correr afterChange, por ejemplo al restaurar un
   respaldo de la base de datos), la portada igual se refresca sola una vez
   por hora en vez de quedar pegada indefinidamente. */
export const revalidate = 3600

/**
 * Portada.
 *
 * Editorial asimétrica, no una cuadrícula de tarjetas iguales: la noticia
 * principal ocupa dos tercios con la foto a sangre; las secundarias caen en
 * columna. La jerarquía se ve antes de leer.
 */
export default async function PaginaInicio() {
  const [destacados, { noticias }, recintos] = await Promise.all([
    listarDestacadosVigentes(),
    listarNoticias({ porPagina: 4 }),
    listarRecintos(),
  ])

  const [principal, ...secundarias] = noticias

  return (
    <>
      {/* Visualmente oculto: la portada no lleva un titular fijo en pantalla
         —el carrusel rota entre varios, cada uno un h2— pero la página igual
         necesita su único h1, el que un lector de pantalla anuncia primero y
         el que usan los buscadores para saber de qué trata. */}
      <h1 className="sr-only">Corporación Municipal de Deportes de San Joaquín</h1>

      {destacados.length > 0 ? (
        <section className="shell py-8 md:py-10">
          <CarruselDestacados destacados={destacados} />
        </section>
      ) : null}

      <section className="shell py-8 md:py-10">
        <ListaEscalonada className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AccesoDestacado
            titulo="Inscríbete en talleres"
            descripcion="Escuelas deportivas y talleres de la Corporación."
            href="https://ejemplo.plataforma.cl/talleres"
            externo
            Icono={IconoBalon}
          />
          <AccesoDestacado
            titulo="Recintos deportivos"
            descripcion="Estadio, gimnasio y piscinas de la comuna."
            href="/recintos"
            Icono={IconoUbicacion}
          />
          <AccesoDestacado
            titulo="Noticias"
            descripcion="Lo último de la Corporación."
            href="/noticias"
            Icono={IconoCalendario}
          />
          <AccesoDestacado
            titulo="Contacto"
            descripcion="Dirección, teléfono y formulario."
            href="/contacto"
            Icono={IconoTelefono}
          />
        </ListaEscalonada>
      </section>

      <section className="border-border border-t py-14 md:py-20">
        <div className="shell">
          <Revelar as="header" className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[26px] leading-tight font-bold md:text-[34px]">
              Últimas noticias
            </h2>
            <Link
              href="/noticias"
              className="text-primary toque inline-flex items-center font-semibold"
            >
              Ver todas →
            </Link>
          </Revelar>

          {principal ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <TarjetaNoticia
                noticia={principal}
                variante="destacada"
                prioridad
                className="lg:col-span-2"
              />
              {secundarias.length > 0 ? (
                <ListaEscalonada className="grid content-start gap-4">
                  {secundarias.map((n) => (
                    <TarjetaNoticia key={n.slug} noticia={n} variante="compacta" />
                  ))}
                </ListaEscalonada>
              ) : null}
            </div>
          ) : (
            <EstadoVacio
              titulo="Sin noticias publicadas todavía"
              descripcion="Cuando se publique la primera noticia, aparecerá aquí."
              Icono={IconoInfo}
            />
          )}
        </div>
      </section>

      {recintos.length > 0 ? (
        <section className="border-border border-t py-14 md:py-20">
          <div className="shell">
            <Revelar as="header" className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[26px] leading-tight font-bold md:text-[34px]">
                Recintos deportivos
              </h2>
              <Link
                href="/recintos"
                className="text-primary toque inline-flex items-center font-semibold"
              >
                Ver todos →
              </Link>
            </Revelar>

            <ListaEscalonada className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recintos.slice(0, 3).map((e) => (
                <FichaRecinto key={e.slug} recinto={e} />
              ))}
            </ListaEscalonada>
          </div>
        </section>
      ) : null}
    </>
  )
}
