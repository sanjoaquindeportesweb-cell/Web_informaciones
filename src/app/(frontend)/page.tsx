import { AccesoDestacado } from '@/componentes/AccesoDestacado'
import { CarruselDestacados } from '@/componentes/CarruselDestacados'
import { EstadoVacio } from '@/componentes/Estados'
import { FichaRecinto } from '@/componentes/FichaRecinto'
import { ICONOS_ACCESO, IconoInfo } from '@/componentes/Iconos'
import { TarjetaNoticia } from '@/componentes/TarjetaNoticia'
import { ListaEscalonada, Revelar } from '@/lib/movimiento'
import {
  listarDestacadosVigentes,
  listarRecintos,
  listarNoticias,
  obtenerPortada,
} from '@/payload/consultas'
import Link from 'next/link'

/* Se renderiza en cada visita, y no es por gusto: acá vivía `revalidate = 3600`
   y en Amplify eso dejaba la portada congelada en el contenido del build.

   Sin `searchParams` que leer, Next prerenderiza esta ruta durante el build. En
   Amplify ese HTML queda dentro del artefacto de despliegue, que es de solo
   lectura, así que Next no puede reescribir la entrada de caché: ni el
   `revalidatePath` de los hooks de Payload ni el vencimiento por tiempo logran
   reemplazarla. Comprobado contra el despliegue —tres horas después de vencida
   la ventana de una hora, cuatro peticiones seguidas devolvían
   `x-nextjs-cache: HIT` con el contenido viejo, y con CloudFront en MISS, o sea
   que era el origen y no el CDN.

   `/noticias` y `/[slug]` nunca tuvieron el problema justamente porque leen
   `searchParams` y eso las vuelve dinámicas. Esto las iguala.

   El costo son las consultas a Mongo en cada visita, el mismo que esas dos
   rutas ya pagaban. Si algún día el portal se muda a un servidor Node propio,
   los hooks de `payload/revalidacion.ts` empiezan a servir de verdad y esto se
   puede volver a cachear. */
export const dynamic = 'force-dynamic'

/**
 * Portada.
 *
 * Editorial asimétrica, no una cuadrícula de tarjetas iguales: la noticia
 * principal ocupa dos tercios con la foto a sangre; las secundarias caen en
 * columna. La jerarquía se ve antes de leer.
 *
 * Esa maquetación es del componente y sigue viviendo acá — es la razón por la
 * que la portada no es un documento de `paginas`. Lo editable son los textos:
 * los accesos rápidos y los dos títulos de sección salen del global «Portada»,
 * y el carrusel, las noticias y los recintos de sus colecciones.
 */
export default async function PaginaInicio() {
  const [destacados, { noticias }, recintos, portada] = await Promise.all([
    listarDestacadosVigentes(),
    listarNoticias({ porPagina: 4 }),
    listarRecintos(),
    obtenerPortada(),
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
          {portada.accesos.map((acceso) => (
            <AccesoDestacado
              key={`${acceso.titulo}-${acceso.href}`}
              titulo={acceso.titulo}
              descripcion={acceso.descripcion}
              href={acceso.href}
              externo={acceso.externo}
              Icono={ICONOS_ACCESO[acceso.icono].Icono}
            />
          ))}
        </ListaEscalonada>
      </section>

      <section className="border-border border-t py-14 md:py-20">
        <div className="shell">
          <Revelar as="header" className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[26px] leading-tight font-bold md:text-[34px]">
              {portada.tituloNoticias}
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
                {portada.tituloRecintos}
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
