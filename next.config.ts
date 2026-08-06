import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    /* El optimizador de imágenes de Amplify solo resuelve archivos estáticos.
       Las fotos del panel no lo son: las sirve Payload desde S3 por la ruta
       dinámica `/api/media/file/...`, que no existe en el origen estático, de
       modo que `next/image` devuelve «Error loading source image» con 404.
       Comprobado contra el despliegue: `/marca/logo.png` optimiza bien y
       `/api/media/file/<archivo>` no, aunque esa misma ruta entregue la
       imagen correctamente cuando se pide directo.

       Apagarlo cuesta poco: Payload ya entrega WebP en tres tamaños (ver
       `Media.ts`), que es justo lo que aportaría el optimizador. Queda tras
       una variable para no perderlo donde sí funciona, como `next dev`. */
    unoptimized: process.env.IMAGENES_SIN_OPTIMIZAR === 'true',
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/muestras/**' },
      { pathname: '/marca/**' },
    ],
    /* Único host externo permitido: las miniaturas de YouTube. El video en sí
       se carga solo cuando alguien lo pulsa, no en cada visita. */
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
