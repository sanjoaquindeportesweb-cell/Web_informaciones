import type { GlobalConfig } from 'payload'

import { OPCIONES_ICONO_ACCESO } from '@/componentes/Iconos'
import { URL_TALLERES } from '@/constantes/enlaces-externos'
import { estaAutenticado } from '@/payload/acceso'
import { revalidarSitio } from '@/payload/revalidacion'
import type { DatosPortada } from '@/tipos'

/**
 * Lo que la portada mostraba cuando estos textos vivían en el componente.
 *
 * No es relleno de demostración: es el contenido real y vigente, y sigue
 * siendo lo que se ve mientras nadie guarde el global. Un entorno nuevo —otra
 * rama, la primera vez que se levanta el proyecto— arranca con la portada
 * completa en vez de con cuatro huecos.
 *
 * Vive en este archivo y no en `payload/consultas.ts` porque la siembra
 * también lo necesita, y `consultas.ts` es `server-only`: importarlo desde un
 * script de Node —que es lo que es `payload run`— lanza el error del propio
 * paquete y la siembra muere antes de escribir nada.
 */
export const PORTADA_POR_DEFECTO: DatosPortada = {
  accesos: [
    {
      titulo: 'Inscríbete en talleres',
      descripcion: 'Escuelas deportivas y talleres de la Corporación.',
      href: URL_TALLERES,
      externo: true,
      icono: 'balon',
    },
    {
      titulo: 'Recintos deportivos',
      descripcion: 'Estadio, gimnasio y piscinas de la comuna.',
      href: '/recintos',
      externo: false,
      icono: 'ubicacion',
    },
    {
      titulo: 'Noticias',
      descripcion: 'Lo último de la Corporación.',
      href: '/noticias',
      externo: false,
      icono: 'calendario',
    },
    {
      titulo: 'Contacto',
      descripcion: 'Dirección, teléfono y formulario.',
      href: '/contacto',
      externo: false,
      icono: 'telefono',
    },
  ],
  tituloNoticias: 'Últimas noticias',
  tituloRecintos: 'Recintos deportivos',
}

/**
 * Las piezas fijas de la portada.
 *
 * La portada no es un documento de `paginas` y no lo va a ser: su maquetación
 * es editorial y asimétrica —la noticia principal a dos tercios con la foto a
 * sangre, las secundarias en columna— y eso no sale de una lista de bloques
 * apilados. Lo que hasta ahora estaba escrito en `app/(frontend)/page.tsx` y
 * no se podía tocar sin un despliegue son los textos: los cuatro accesos
 * rápidos y los dos encabezados de sección. Eso es lo que vive aquí.
 *
 * El resto de la portada ya salía del panel y sigue igual: el carrusel es la
 * colección «Destacados», y las dos rejillas se llenan solas con las noticias
 * y los recintos más recientes.
 *
 * Todo campo es opcional. Un global vacío —el estado en que queda cualquier
 * entorno nuevo hasta que alguien lo guarde por primera vez— tiene que
 * devolver la portada de siempre, no una portada mutilada: de eso se encarga
 * `PORTADA_POR_DEFECTO`, arriba.
 */
export const Portada: GlobalConfig = {
  slug: 'portada',
  label: 'Portada',
  admin: {
    description:
      'Los accesos rápidos y los títulos de sección de la página de inicio. El carrusel se edita en «Destacados»; las noticias y los recintos se llenan solos.',
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
      name: 'accesos',
      type: 'array',
      label: 'Accesos rápidos',
      maxRows: 4,
      admin: {
        description:
          'La fila de cuatro tarjetas bajo el carrusel. Con menos de cuatro la fila se acomoda sola; si dejas la lista vacía, se muestran los cuatro de siempre.',
      },
      fields: [
        { name: 'titulo', type: 'text', required: true },
        {
          name: 'descripcion',
          type: 'text',
          admin: { description: 'Una línea. La tarjeta es chica y un párrafo no cabe.' },
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          admin: {
            description: 'Ruta interna que empieza con / (ej: /recintos) o URL externa completa.',
          },
        },
        {
          name: 'externo',
          type: 'checkbox',
          defaultValue: false,
          label: 'Sale del portal',
          admin: {
            description:
              'Márcalo si lleva a la plataforma de trámites o a otro sitio: se abre en otra pestaña y la tarjeta lo avisa.',
          },
        },
        {
          name: 'icono',
          type: 'select',
          required: true,
          defaultValue: 'info',
          options: OPCIONES_ICONO_ACCESO,
          admin: { description: 'El dibujo del cuadrito de arriba de la tarjeta.' },
        },
      ],
    },
    {
      name: 'tituloNoticias',
      type: 'text',
      label: 'Título de la sección de noticias',
      admin: { placeholder: 'Últimas noticias' },
    },
    {
      name: 'tituloRecintos',
      type: 'text',
      label: 'Título de la sección de recintos',
      admin: { placeholder: 'Recintos deportivos' },
    },
  ],
}
