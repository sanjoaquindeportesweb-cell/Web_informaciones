import path from 'path'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { estaAutenticado } from '@/payload/acceso'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Genera el placeholder borroso (LQIP) que usa `next/image` mientras carga la
 * foto de verdad. Va en `beforeChange`, no en `afterChange`: modifica `data`
 * directo, antes de guardar, así que no hace falta un segundo `update()`
 * después —que además dispararía este mismo hook otra vez—.
 *
 * Solo corre cuando llega un archivo nuevo (`req.file`): editar el texto
 * alternativo de una imagen ya subida no reprocesa nada.
 */
const generarDesenfoque: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!req.file) return data

  try {
    const miniatura = await sharp(req.file.data).resize(16).webp({ quality: 40 }).toBuffer()
    return { ...data, blurDataURL: `data:image/webp;base64,${miniatura.toString('base64')}` }
  } catch {
    /* Una imagen que sharp no puede leer (poco probable si ya pasó el
       `mimeTypes` de arriba) no debería impedir subir el archivo — se guarda
       sin placeholder y `next/image` cae de vuelta a su comportamiento
       normal, sin `blur`. */
    return data
  }
}

/**
 * Biblioteca de medios.
 *
 * Solo imágenes: el portal no tiene un repositorio documental como el de la
 * plataforma de trámites, así que no hace falta la validación de PDF/Office
 * que ese proyecto necesita. `image/svg+xml` queda fuera aunque técnicamente
 * sea una imagen — un SVG puede llevar `<script>` dentro, y aquí se sirve tal
 * cual desde `/media`.
 *
 * `alt` es obligatorio sin excepción: una imagen sin alt no existe para quien
 * usa lector de pantalla, y no hay forma de arreglarlo después del hecho una
 * vez que la noticia ya está publicada y compartida.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Medios' },
  admin: {
    description: 'Fotografías del portal. El texto alternativo es obligatorio.',
  },
  access: {
    read: () => true,
    create: estaAutenticado,
    update: estaAutenticado,
    delete: estaAutenticado,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
  },
  hooks: {
    beforeChange: [generarDesenfoque],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
      admin: {
        description: 'Describe la imagen para quien no puede verla. Obligatorio.',
      },
    },
    {
      name: 'blurDataURL',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Miniatura borrosa generada sola al subir la imagen. No se edita a mano.',
      },
    },
  ],
}
