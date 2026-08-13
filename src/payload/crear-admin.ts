/**
 * Alta (o rescate) de una cuenta de administrador.
 *
 * Payload solo regala la pantalla de «crear primer usuario» mientras la
 * colección está vacía, y ese formulario deja el rol en su `defaultValue`:
 * `editor`. Si la primera cuenta de un entorno se creó por ahí, nadie puede
 * ascenderla —`rol` tiene acceso de campo `esAdminCampo`, y `create` de la
 * colección exige admin—, así que el panel queda sin forma de crear
 * administradores. Este script entra por debajo del control de acceso
 * (`overrideAccess: true`) y es la única salida.
 *
 * Se ejecuta con `pnpm crear-admin` apuntando al entorno que toque:
 *
 *   DATABASE_URL=... ADMIN_PASSWORD=... pnpm crear-admin
 *
 * Es idempotente: si la cuenta ya existe la asciende a `admin` y, solo si se
 * entrega `ADMIN_PASSWORD`, le cambia la contraseña. Sin `ADMIN_PASSWORD` en
 * un alta nueva genera una al azar y la imprime una única vez.
 */

import { randomBytes } from 'node:crypto'
import { getPayload } from 'payload'

import config from '@/payload.config'

const EMAIL = process.env.ADMIN_EMAIL || 'adminsoporte@awna.cl'
const NOMBRE = process.env.ADMIN_NOMBRE || 'Soporte'

/* base64url sobre 18 bytes: 24 caracteres sin ambigüedad de comillas ni
   escapes, que es lo que importa cuando la contraseña se copia y pega desde
   una terminal. */
const contrasenaAlAzar = () => randomBytes(18).toString('base64url')

const crearAdmin = async () => {
  const payload = await getPayload({ config })

  const existentes = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
    overrideAccess: true,
  })

  const existente = existentes.docs[0]
  const contrasenaEntregada = process.env.ADMIN_PASSWORD

  if (existente) {
    const contrasena = contrasenaEntregada
    await payload.update({
      collection: 'users',
      id: existente.id,
      overrideAccess: true,
      data: {
        rol: 'admin',
        ...(contrasena ? { password: contrasena } : {}),
      },
    })
    payload.logger.info(
      `Cuenta existente ${EMAIL} ascendida a administrador${
        contrasena ? ' y con contraseña actualizada' : ' (contraseña sin cambios)'
      }.`,
    )
    process.exit(0)
  }

  const contrasena = contrasenaEntregada || contrasenaAlAzar()

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: EMAIL,
      nombre: NOMBRE,
      rol: 'admin',
      password: contrasena,
    },
  })

  payload.logger.info(`Administrador creado: ${EMAIL}`)
  if (!contrasenaEntregada) {
    /* Por stdout y no por el logger: esto se copia y pega, no se archiva. */
    console.log(`\nContraseña generada (cámbiala tras el primer ingreso):\n\n  ${contrasena}\n`)
  }

  process.exit(0)
}

/* `await` de nivel superior, no una promesa suelta: ver la nota en
   `sembrar.ts` — `payload run` hace `await import(...)` y el proceso puede
   cerrarse antes de que corra nada asíncrono. */
try {
  await crearAdmin()
} catch (error) {
  console.error(error)
  process.exit(1)
}
