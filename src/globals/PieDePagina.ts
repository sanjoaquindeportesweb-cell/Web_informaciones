import type { GlobalConfig } from 'payload'

import { camposEnlace } from '@/payload/campos'
import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'

/**
 * Enlaces legales — Transparencia, Ley del Lobby, Privacidad.
 *
 * El `slug` sigue siendo `pie-de-pagina` y no se toca: cambiarlo dejaría
 * huérfano el documento que ya está guardado en la base y el panel abriría un
 * global vacío. Lo que cambió es la etiqueta, que decía «Pie de página»
 * mientras estos enlaces se pintaban —y se siguen pintando— en la franja
 * violeta oscura sobre la cabecera. El nombre prometía un sitio y editaba
 * otro, y desde el panel no había forma de saberlo.
 */
export const PieDePagina: GlobalConfig = {
  slug: 'pie-de-pagina',
  label: 'Barra superior',
  admin: {
    description:
      'La franja delgada que va sobre el logo, con los enlaces legales y los íconos de redes sociales. Las redes se cargan en «Ajustes del sitio».',
  },
  access: {
    read: () => true,
    update: estaAutenticado,
  },
  hooks: {
    afterChange: [revalidarSitio],
  },
  fields: [
    {
      name: 'enlacesLegales',
      type: 'array',
      label: 'Enlaces legales',
      admin: {
        description:
          'Transparencia, Ley del Lobby, Privacidad. Si apuntan al portal del municipio y no a una página de este sitio, marca «Sale del portal».',
      },
      /**
       * Los campos comunes MÁS una segunda línea propia de estos enlaces.
       *
       * No se añade a `camposEnlace` porque ese conjunto lo comparte el menú
       * principal, donde un ítem de dos líneas no tiene sentido: «Noticias» no
       * lleva bajada. Aquí sí, y es lo que pide el formato institucional —el
       * mismo del subdominio de talleres—: arriba, en pequeño, para qué sirve
       * («Solicitar información»); abajo, en negrita, bajo qué ley
       * («Ley de Transparencia»).
       *
       * Es opcional a propósito. Los tres enlaces legales de una corporación
       * suelen tener ley, pero «Privacidad» no la tiene, y obligar a inventarle
       * una para poder guardar sería peor que dejarlo en una línea.
       */
      fields: [
        ...camposEnlace,
        {
          name: 'titulo',
          type: 'text',
          label: 'Segunda línea (ley o norma)',
          admin: {
            description:
              'Se pinta debajo de la etiqueta y en negrita. Ej.: etiqueta «Solicitar información», segunda línea «Ley de Transparencia». Déjalo vacío para un enlace de una sola línea.',
          },
        },
      ],
    },
  ],
}
