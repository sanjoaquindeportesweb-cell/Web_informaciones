import type { Metadata } from 'next'

import { FormularioContacto } from '@/componentes/FormularioContacto'
import { IconoCorreo, IconoTelefono, IconoUbicacion } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { obtenerDatosSitio } from '@/payload/consultas'
import { enviarMensajeDeContacto } from './acciones'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribe a la Corporación Municipal de Deportes de San Joaquín.',
}

export default async function PaginaContacto() {
  const sitio = await obtenerDatosSitio()

  return (
    <>
      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: 'Contacto' }]} />
        <h1 className="font-display mt-4 text-[40px] leading-[1.02] font-black md:text-[56px]">
          Contacto
        </h1>
      </div>

      <div className="shell grid gap-10 pb-16 md:pb-24 lg:grid-cols-[1fr_20rem]">
        <div className="border-border bg-card rounded-[var(--radius-lg)] border p-6 md:p-8">
          <FormularioContacto onEnviar={enviarMensajeDeContacto} />
        </div>

        <div className="grid content-start gap-6">
          <div className="border-border bg-card rounded-[var(--radius-lg)] border p-6">
            <h2 className="font-display mb-4 font-bold">Datos de contacto</h2>
            <ul className="grid gap-3 text-[15px]">
              <li className="flex items-start gap-2">
                <IconoUbicacion className="text-acento mt-0.5 shrink-0" />
                {sitio.direccion}
              </li>
              <li className="flex items-center gap-2">
                <IconoTelefono className="text-acento shrink-0" />
                <span className="tabular">{sitio.telefono}</span>
              </li>
              <li className="flex items-center gap-2">
                <IconoCorreo className="text-acento shrink-0" />
                {sitio.correo}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
