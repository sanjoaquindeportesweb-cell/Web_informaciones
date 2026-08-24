import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { formBuilderPlugin, formBuilderTranslations } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin, redirectsTranslations } from '@payloadcms/plugin-redirects'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { NOMBRE_ORGANIZACION, URL_DEL_SITIO } from './constantes/sitio'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Noticias } from './collections/Noticias'
import { Recintos } from './collections/Recintos'
import { Galerias } from './collections/Galerias'
import { Videos } from './collections/Videos'
import { Paginas } from './collections/Paginas'
import { Destacados } from './collections/Destacados'
import { MensajesContacto } from './collections/MensajesContacto'
import { Navegacion } from './globals/Navegacion'
import { PieDePagina } from './globals/PieDePagina'
import { AjustesDelSitio } from './globals/AjustesDelSitio'
import { Portada } from './globals/Portada'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/* En un servidor propio las imágenes viven en `staticDir` (ver Media.ts) y eso
   basta. En hosting serverless —Amplify, Lambda— el disco es de solo lectura y
   efímero: subir una foto falla y las ya subidas desaparecen al reciclarse el
   contenedor. Con `S3_BUCKET` definido, las subidas van al bucket; sin él, se
   mantiene el disco local para que `pnpm dev` siga funcionando sin AWS. */
const BUCKET_S3 = process.env.S3_BUCKET

/* Las credenciales explícitas son para desarrollo. En AWS lo correcto es dejar
   que el SDK use el rol IAM del entorno, que es lo que ocurre si estas dos
   variables no están. */
const CREDENCIALES_S3 =
  process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      }
    : undefined

/* Payload sin adaptador de email no se cae: escribe el correo en la consola del
   servidor y sigue como si nada. En `pnpm dev` eso es lo deseable —nadie quiere
   que probar un formulario mande correos a direcciones reales—, y en producción
   es una trampa, porque lo que se pierde en silencio es la recuperación de
   contraseña del panel. Ese es el único camino de vuelta si alguien de
   comunicaciones olvida la suya, y no hay señal de que no llegó: el panel
   responde «te enviamos un correo» igual.

   Con las dos variables definidas se envía de verdad; sin ellas se mantiene el
   comportamiento de consola. Se piden las dos y no solo la clave porque Resend
   rechaza el envío si el dominio del remitente no está verificado en la cuenta,
   así que una clave sin el remitente correcto falla en todos los correos. */
const CLAVE_RESEND = process.env.RESEND_API_KEY
const EMAIL_REMITENTE = process.env.EMAIL_REMITENTE

/* Cada colección con página propia sabe resolver su ruta pública. El `?
   vistaPrevia=1` es lo que las rutas de `app/(frontend)` leen para decidir
   si piden el borrador — ver `payload/vista-previa.ts`. */
const RUTA_PUBLICA: Partial<Record<string, (slug: string) => string>> = {
  noticias: (slug) => `/noticias/${slug}`,
  recintos: (slug) => `/recintos/${slug}`,
  galerias: (slug) => `/galerias/${slug}`,
  paginas: (slug) => `/${slug}`,
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Panel · Deportes San Joaquín',
    },
    livePreview: {
      collections: ['noticias', 'recintos', 'galerias', 'paginas'],
      url: ({ data, collectionConfig }) => {
        const aRuta = collectionConfig && RUTA_PUBLICA[collectionConfig.slug]
        const ruta = aRuta && typeof data?.slug === 'string' ? aRuta(data.slug) : '/'
        return `${URL_DEL_SITIO}${ruta}?vistaPrevia=1`
      },
      breakpoints: [
        { label: 'Celular', name: 'movil', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Escritorio', name: 'escritorio', width: 1440, height: 900 },
      ],
    },
  },
  /* Panel en español: lo usa personal de comunicaciones, no gente técnica.
     Los plugins traen su propio paquete de traducciones — sin fusionarlo
     aquí, sus campos se verían en inglés aunque el resto del panel esté en
     español. */
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es },
    translations: {
      /* Dos formas distintas de exportar traducciones por plugin: redirects
         entrega el objeto plano por idioma; form-builder lo envuelve en
         `{ dateFNSKey, translations }`. No es un capricho de tipado, se
         comprobó en tiempo de ejecución que de verdad difieren. */
      es: {
        ...redirectsTranslations.es,
        ...formBuilderTranslations.es?.translations,
      },
    },
  },
  collections: [
    Users,
    Media,
    Noticias,
    Recintos,
    Galerias,
    Videos,
    Paginas,
    Destacados,
    MensajesContacto,
  ],
  globals: [Navegacion, PieDePagina, AjustesDelSitio, Portada],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  /* A diferencia de `s3Storage`, este no queda siempre declarado con un
     interruptor: `email` es una clave de configuración, no un plugin con
     `enabled`. Tampoco hace falta, y esa es la diferencia que importa acá: el
     adaptador de correo es solo de servidor y no registra proveedores de React
     en `admin.components.providers`, así que no toca `importMap.js` y no puede
     repetir el /admin en blanco que dejó el bucket. Entra y sale de la config
     sin consecuencias. */
  ...(CLAVE_RESEND && EMAIL_REMITENTE
    ? {
        email: resendAdapter({
          apiKey: CLAVE_RESEND,
          defaultFromAddress: EMAIL_REMITENTE,
          defaultFromName: NOMBRE_ORGANIZACION,
        }),
      }
    : {}),
  /* La publicación programada (noticias, recintos, galerías, páginas)
     depende de que algo procese la cola de jobs. `autoRun` con un cron cada
     minuto es correcto para un servidor Node propio — el plan del proyecto
     ya descarta exportación estática y Vercel-serverless por eso mismo.

     En serverless no hay proceso persistente: `autoRun` nunca dispararía y la
     publicación programada quedaría muerta en silencio, que es lo peor que
     puede pasar aquí. Por eso el cron interno se activa con `EJECUTAR_JOBS`
     —se pone en un servidor propio— y, cuando no está, la cola se procesa
     llamando `GET /api/payload-jobs/run` desde fuera (EventBridge, un cron
     externo) con la cabecera `Authorization: Bearer $CRON_SECRET`.

     **Es GET, no POST.** Aquí decía POST y era falso: en 3.87 la ruta está
     registrada solo para GET —Payload la definió así a propósito, para que
     sirva desde un cron de Vercel— y con POST devuelve 404. Comprobado contra
     el despliegue: GET responde 401 «No autorizado» (la ruta existe y rechaza
     por credenciales) y POST responde 404 (la ruta no existe). Un cron montado
     siguiendo la instrucción vieja habría recibido 404 en cada ejecución, con
     el cron aparentemente instalado y la publicación programada igual de
     muerta, que es exactamente el fallo silencioso que este bloque intentaba
     evitar.

     Ojo también con la basic auth de Amplify: cubre `/api/*` y usa la misma
     cabecera `Authorization`, así que mientras esté encendida ningún cron
     externo puede autenticarse contra este endpoint. Las dos cabeceras chocan
     y gana el portero. */
  jobs: {
    access: {
      run: ({ req }) => {
        if (req.user) return true
        const clave = process.env.CRON_SECRET
        return Boolean(clave) && req.headers.get('authorization') === `Bearer ${clave}`
      },
    },
    autoRun:
      process.env.EJECUTAR_JOBS === 'true' ? [{ cron: '* * * * *', queue: 'default' }] : [],
  },
  plugins: [
    /* Para cuando cambie una URL como pasó con /escenarios → /recintos: un
       enlace viejo desde Google o redes no debería morir en un 404. */
    redirectsPlugin({
      collections: ['paginas', 'noticias', 'recintos', 'galerias'],
      overrides: {
        slug: 'redirecciones',
        labels: { singular: 'Redirección', plural: 'Redirecciones' },
        admin: {
          description:
            'Cuando una URL cambie o se elimine una página, crea una entrada aquí para que el enlace viejo no se rompa.',
        },
      },
    }),
    /* Formularios genéricos (encuestas, inscripción a un evento puntual) sin
       tocar código. El formulario de contacto no pasa por aquí a propósito:
       ya tiene su propio límite por IP y honeypot hechos a medida, que este
       plugin no sabe replicar. */
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        checkbox: true,
        number: true,
        message: true,
        date: true,
        state: false,
        country: false,
        payment: false,
      },
      redirectRelationships: ['paginas'],
      formOverrides: {
        labels: { singular: 'Formulario', plural: 'Formularios' },
      },
      formSubmissionOverrides: {
        labels: { singular: 'Respuesta de formulario', plural: 'Respuestas de formularios' },
      },
    }),
    /* Siempre en la lista, activo solo si hay bucket. Apagado no toca nada:
       las subidas siguen yendo al disco local, que es lo correcto en `pnpm
       dev`. Y encendido apunta al bucket, sin arrancar contra uno vacío.

       Lo que no puede es entrar y salir de `plugins` según el entorno. El
       plugin registra un proveedor de React en `admin.components.providers`
       (`S3ClientUploadHandler`), y ese proveedor tiene que estar en
       `admin/importMap.js`, que se genera una vez y se versiona. Generado sin
       `S3_BUCKET`, el mapa no lo incluía; en Amplify, donde sí está definido,
       `RenderServerComponent` no lograba resolverlo y devolvía `null`.
       Como el proveedor envuelve al resto del panel, se llevaba por delante
       todo el árbol: /admin en blanco, sin un solo error en consola ni en el
       servidor. Declarándolo siempre, el mapa vale para los dos entornos. */
    s3Storage({
      enabled: Boolean(BUCKET_S3),
      collections: { media: true },
      bucket: BUCKET_S3 ?? '',
      config: {
        region: process.env.S3_REGION,
        ...(CREDENCIALES_S3 ? { credentials: CREDENCIALES_S3 } : {}),
      },
    }),
  ],
})
