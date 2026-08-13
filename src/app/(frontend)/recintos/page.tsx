import { EstadoVacio } from '@/componentes/Estados'
import { FichaRecinto } from '@/componentes/FichaRecinto'
import { IconoUbicacion } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { ListaEscalonada } from '@/lib/movimiento'
import { metadatosDeListado } from '@/lib/seo'
import { listarRecintos } from '@/payload/consultas'

/* Dinámica por lo mismo que la portada: prerenderizada en el build, en Amplify
   se quedaba clavada con los recintos que existían al compilar. Ver el comentario
   largo en `app/(frontend)/page.tsx`. */
export const dynamic = 'force-dynamic'

export const metadata = metadatosDeListado(
  'Recintos deportivos',
  'Estadio, gimnasio, piscinas y demás recintos que administra la Corporación.',
)

export default async function PaginaRecintos() {
  const recintos = await listarRecintos()

  return (
    <>
      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: 'Recintos' }]} />
        <h1 className="font-display mt-4 text-[40px] leading-[1.02] font-black md:text-[56px]">
          Recintos deportivos
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
          Estadio, gimnasio, piscinas y multicanchas de la comuna, con su horario de atención.
        </p>
      </div>

      <div className="shell pb-16 md:pb-24">
        {recintos.length === 0 ? (
          <EstadoVacio
            titulo="Sin recintos publicados todavía"
            descripcion="Cuando se publique el primero, aparecerá aquí."
            Icono={IconoUbicacion}
          />
        ) : (
          <ListaEscalonada className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3" as="ul">
            {recintos.map((e, i) => (
              <FichaRecinto key={e.slug} recinto={e} prioridad={i === 0} />
            ))}
          </ListaEscalonada>
        )}
      </div>
    </>
  )
}
