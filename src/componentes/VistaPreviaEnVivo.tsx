'use client'

import { RefreshRouteOnSave as Componente } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

import { URL_DEL_SITIO } from '@/constantes/sitio'

/**
 * Puente entre el panel de Payload y esta página.
 *
 * El panel manda un `postMessage` cada vez que se guarda un borrador; esto
 * escucha ese mensaje y llama `router.refresh()`, que vuelve a pedir los
 * datos a la Local API sin recargar la página completa. Solo se monta
 * cuando la ruta está en modo vista previa — el resto de las visitas nunca
 * cargan este componente.
 *
 * `serverURL` se usa para comprobar el origen del mensaje, y un origen jamás
 * lleva barra final: pasando la variable cruda —que en Amplify estaba escrita
 * como `https://…amplifyapp.com/`— la comparación fallaba y el panel se
 * quedaba sin refrescar la vista previa, sin un solo error a la vista. De ahí
 * que use la constante normalizada y no `process.env` directo.
 */
export const VistaPreviaEnVivo = () => {
  const router = useRouter()

  return <Componente refresh={() => router.refresh()} serverURL={URL_DEL_SITIO} />
}
