import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { formBuilderPlugin, formBuilderTranslations } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin, redirectsTranslations } from '@payloadcms/plugin-redirects'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const URL_DEL_SITIO = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

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
  globals: [Navegacion, PieDePagina, AjustesDelSitio],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  /* La publicación programada (noticias, recintos, galerías, páginas)
     depende de que algo procese la cola de jobs. `autoRun` con un cron cada
     minuto es correcto para un servidor Node propio — el plan del proyecto
     ya descarta exportación estática y Vercel-serverless por eso mismo.

     En serverless no hay proceso persistente: `autoRun` nunca dispararía y la
     publicación programada quedaría muerta en silencio, que es lo peor que
     puede pasar aquí. Por eso el cron interno se activa con `EJECUTAR_JOBS`
     —se pone en un servidor propio— y, cuando no está, la cola se procesa
     llamando `POST /api/payload-jobs/run` desde fuera (EventBridge, un cron
     externo) con la cabecera `Authorization: Bearer $CRON_SECRET`. */
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
    /* Se añade solo si hay bucket configurado: sin esto, el adaptador arranca
       apuntando a un bucket vacío y toda subida falla en runtime. */
    ...(BUCKET_S3
      ? [
          s3Storage({
            collections: { media: true },
            bucket: BUCKET_S3,
            config: {
              region: process.env.S3_REGION,
              ...(CREDENCIALES_S3 ? { credentials: CREDENCIALES_S3 } : {}),
            },
          }),
        ]
      : []),
  ],
})
