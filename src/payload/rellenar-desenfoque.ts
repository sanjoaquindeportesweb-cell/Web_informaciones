/**
 * Rellena `blurDataURL` en medios que ya existían antes de que ese campo
 * existiera. `pnpm sembrar` es «crear si no existe» (ver nota en
 * `sembrar.ts`), así que las fotos de muestra cargadas antes de este hook se
 * quedaron con el campo vacío para siempre si nadie las vuelve a subir.
 *
 * Se ejecuta con `pnpm rellenar-desenfoque`. Es seguro correrlo varias
 * veces: solo toca los documentos donde `blurDataURL` todavía está vacío.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const rellenar = async () => {
  const payload = await getPayload({ config })
  payload.logger.info('Buscando medios sin miniatura borrosa…')

  const { docs } = await payload.find({
    collection: 'media',
    overrideAccess: true,
    limit: 200,
    where: { blurDataURL: { exists: false } },
  })

  for (const doc of docs) {
    if (!doc.filename) continue
    const rutaArchivo = path.resolve(dirname, '../../media', doc.filename)
    try {
      const miniatura = await sharp(rutaArchivo).resize(16).webp({ quality: 40 }).toBuffer()
      await payload.update({
        collection: 'media',
        id: doc.id,
        overrideAccess: true,
        data: { blurDataURL: `data:image/webp;base64,${miniatura.toString('base64')}` },
      })
      payload.logger.info(`  ✓ ${doc.filename}`)
    } catch (error) {
      payload.logger.warn(`  ✗ ${doc.filename}: ${String(error)}`)
    }
  }

  payload.logger.info(`Listo: ${docs.length} medio(s) revisado(s).`)
  process.exit(0)
}

try {
  await rellenar()
} catch (error) {
  console.error(error)
  process.exit(1)
}
