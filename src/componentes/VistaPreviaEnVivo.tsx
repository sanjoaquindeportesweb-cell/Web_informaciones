'use client'

import { RefreshRouteOnSave as Componente } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Puente entre el panel de Payload y esta página.
 *
 * El panel manda un `postMessage` cada vez que se guarda un borrador; esto
 * escucha ese mensaje y llama `router.refresh()`, que vuelve a pedir los
 * datos a la Local API sin recargar la página completa. Solo se monta
 * cuando la ruta está en modo vista previa — el resto de las visitas nunca
 * cargan este componente.
 */
export const VistaPreviaEnVivo = () => {
  const router = useRouter()

  return (
    <Componente
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL ?? ''}
    />
  )
}
