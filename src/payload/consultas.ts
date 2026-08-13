import 'server-only'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { SITIO_DEMO, type DatosSitio } from '@/componentes/layout/PageShell'
import { CLAVES_RED, ICONOS_ACCESO, type ClaveIconoAcceso } from '@/componentes/Iconos'
import { PORTADA_POR_DEFECTO } from '@/globals/Portada'
import type { CampoFormulario, DatosFormulario } from '@/componentes/FormularioDinamico'
import type { DiaHorario } from '@/lib/horarios'
import type { Bloque } from '@/bloques/Bloques'
import type {
  AccesoPortada,
  DatosPortada,
  Destacado,
  Recinto,
  ItemNavegacion,
  Imagen,
  Noticia,
} from '@/tipos'
import type {
  Recinto as RecintoDoc,
  Form as FormDoc,
  Galeria as GaleriaDoc,
  Media,
  Noticia as NoticiaDoc,
  Pagina as PaginaDoc,
} from '@/payload-types'

/**
 * Capa de datos del portal público.
 *
 * Todo pasa por la Local API con `overrideAccess: false`: es la misma regla
 * que ya se probó en el panel (`publicoSiPublicado`) — sin sesión, sin
 * borradores. El frontend público nunca se autentica, así que no hay
 * `req.user` que pasarle: el resultado es siempre «solo lo publicado»,
 * calcado del comportamiento que se verificó a mano contra la API en la
 * tarea anterior.
 *
 * Los mapeos devuelven exactamente los tipos de `src/tipos.ts`, los mismos
 * que ya consumen los 14 componentes: una ruta nunca le pasa un documento de
 * Payload crudo a un componente de presentación.
 */

const obtenerPayload = () => getPayload({ config })

/**
 * `vistaPrevia` ya llegó autorizada por `vistaPreviaAutorizada()` —aquí no se
 * vuelve a comprobar sesión, solo se traduce a las dos opciones que la Local
 * API necesita: `draft` para leer la versión sin publicar y `overrideAccess`
 * para saltarse `publicoSiPublicado`, que de otro modo la dejaría fuera
 * porque `req.user` nunca llega poblado a través de la Local API.
 */
const opcionesDeAcceso = (vistaPrevia: boolean) => ({
  draft: vistaPrevia,
  overrideAccess: vistaPrevia,
})

/* --- Imágenes ---------------------------------------------------------- */

const esMedia = (valor: unknown): valor is Media =>
  typeof valor === 'object' && valor !== null && 'url' in valor

export const aImagen = (valor: unknown): Imagen | undefined => {
  if (!esMedia(valor) || !valor.url) return undefined
  return {
    url: valor.url,
    alt: valor.alt,
    ancho: valor.width ?? undefined,
    alto: valor.height ?? undefined,
    desenfoque: valor.blurDataURL ?? undefined,
  }
}

/* --- Noticias ------------------------------------------------------------ */

const aNoticia = (doc: NoticiaDoc): Noticia => ({
  slug: doc.slug,
  titulo: doc.titulo,
  bajada: doc.bajada ?? undefined,
  categoria: doc.categoria,
  publicadaEn: doc.publicadaEn,
  portada: aImagen(doc.portada),
})

export type NoticiaCompleta = Noticia & { cuerpoHTML: string; seo: MetaSEO }

const aNoticiaCompleta = (doc: NoticiaDoc): NoticiaCompleta => ({
  ...aNoticia(doc),
  cuerpoHTML: doc.cuerpo ? convertLexicalToHTML({ data: doc.cuerpo }) : '',
  seo: aSEO(doc.seo, doc.titulo, doc.bajada, doc.portada),
})

export const listarNoticias = async ({
  categoria,
  pagina = 1,
  porPagina = 9,
}: {
  categoria?: string
  pagina?: number
  porPagina?: number
} = {}) => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'noticias',
    overrideAccess: false,
    depth: 1,
    sort: '-publicadaEn',
    page: pagina,
    limit: porPagina,
    where: categoria ? { categoria: { equals: categoria } } : undefined,
  })

  return {
    noticias: resultado.docs.map(aNoticia),
    totalPaginas: resultado.totalPages,
    totalDocs: resultado.totalDocs,
    paginaActual: resultado.page ?? 1,
  }
}

export const listarNoticiasRelacionadas = async (categoria: string, excluirSlug: string, limite = 3) => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'noticias',
    overrideAccess: false,
    depth: 1,
    sort: '-publicadaEn',
    limit: limite,
    where: { and: [{ categoria: { equals: categoria } }, { slug: { not_equals: excluirSlug } }] },
  })
  return resultado.docs.map(aNoticia)
}

export const obtenerNoticiaPorSlug = async (
  slug: string,
  vistaPrevia = false,
): Promise<NoticiaCompleta | null> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'noticias',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    ...opcionesDeAcceso(vistaPrevia),
  })
  const doc = resultado.docs[0]
  return doc ? aNoticiaCompleta(doc) : null
}

/* --- Recintos ------------------------------------------------------------ */

/* Payload guarda `dia` como texto ('0'..'6') porque un `select` no admite
   opciones numéricas; `lib/horarios.ts` lo necesita como número para poder
   compararlo con `Date.getDay()`. La conversión vive aquí y en ningún otro
   lado — es la frontera entre el esquema de Payload y el resto del sitio. */
const aHorarios = (horarios: RecintoDoc['horarios']): DiaHorario[] =>
  (horarios ?? []).map((h) => ({
    dia: Number(h.dia),
    tramos: (h.tramos ?? []).map((t) => ({ inicio: t.inicio, fin: t.fin })),
  }))

const aRecinto = (doc: RecintoDoc): Recinto => ({
  slug: doc.slug,
  nombre: doc.nombre,
  direccion: doc.direccion,
  disciplinas: doc.disciplinas ?? [],
  aforo: doc.aforo ?? undefined,
  horarios: aHorarios(doc.horarios),
  portada: aImagen(doc.portada),
  urlReserva: doc.urlReserva ?? undefined,
})

export const listarRecintos = async (): Promise<Recinto[]> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'recintos',
    overrideAccess: false,
    depth: 1,
    sort: 'nombre',
    limit: 100,
  })
  return resultado.docs.map(aRecinto)
}

export const obtenerRecintoPorSlug = async (
  slug: string,
  vistaPrevia = false,
): Promise<(Recinto & { seo: MetaSEO }) | null> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'recintos',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    ...opcionesDeAcceso(vistaPrevia),
  })
  const doc = resultado.docs[0]
  if (!doc) return null
  return { ...aRecinto(doc), seo: aSEO(doc.seo, doc.nombre, doc.direccion, doc.portada) }
}

/* --- Galerías ------------------------------------------------------------ */

export type GaleriaListado = {
  slug: string
  titulo: string
  descripcion?: string
  portada?: Imagen
}

export type GaleriaCompleta = GaleriaListado & { imagenes: Imagen[]; seo: MetaSEO }

const aGaleriaListado = (doc: GaleriaDoc): GaleriaListado => ({
  slug: doc.slug,
  titulo: doc.titulo,
  descripcion: doc.descripcion ?? undefined,
  portada: aImagen(doc.portada),
})

export const listarGalerias = async (): Promise<GaleriaListado[]> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'galerias',
    overrideAccess: false,
    depth: 1,
    sort: '-createdAt',
    limit: 50,
  })
  return resultado.docs.map(aGaleriaListado)
}

export const obtenerGaleriaPorSlug = async (
  slug: string,
  vistaPrevia = false,
): Promise<GaleriaCompleta | null> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'galerias',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
    ...opcionesDeAcceso(vistaPrevia),
  })
  const doc = resultado.docs[0]
  if (!doc) return null
  const imagenes = (doc.imagenes ?? []).map(aImagen).filter((img): img is Imagen => Boolean(img))
  return {
    ...aGaleriaListado(doc),
    imagenes,
    seo: aSEO(doc.seo, doc.titulo, doc.descripcion, doc.portada),
  }
}

/* --- Páginas por bloques -------------------------------------------------- */

/**
 * Convierte los campos del plugin de formularios a la forma que entiende
 * `FormularioDinamico`. Un tipo de campo que el plugin admite pero que no
 * está en `CampoFormulario` (por ejemplo si algún día se habilita `payment`
 * o `upload`) se descarta en silencio: el resto del formulario se sigue
 * viendo, en vez de que la página entera truene por un campo que el
 * componente todavía no sabe pintar.
 */
const aFormulario = (form: FormDoc): DatosFormulario => {
  const campos = (form.fields ?? [])
    .map((campo): CampoFormulario | null => {
      switch (campo.blockType) {
        case 'email':
          return {
            tipo: 'email',
            name: campo.name,
            label: campo.label ?? undefined,
            required: campo.required ?? undefined,
          }
        case 'text':
        case 'textarea':
        case 'number':
        case 'date':
          return {
            tipo: campo.blockType,
            name: campo.name,
            label: campo.label ?? undefined,
            required: campo.required ?? undefined,
            defaultValue: campo.defaultValue ?? undefined,
          }
        case 'select':
          return {
            tipo: 'select',
            name: campo.name,
            label: campo.label ?? undefined,
            required: campo.required ?? undefined,
            defaultValue: campo.defaultValue ?? undefined,
            opciones: (campo.options ?? []).map((o) => ({ label: o.label, value: o.value })),
          }
        case 'checkbox':
          return {
            tipo: 'checkbox',
            name: campo.name,
            label: campo.label ?? undefined,
            required: campo.required ?? undefined,
            defaultValue: campo.defaultValue ?? undefined,
          }
        default:
          return null
      }
    })
    .filter((c): c is CampoFormulario => c !== null)

  return {
    id: String(form.id),
    titulo: form.title,
    campos,
    textoBoton: form.submitButtonLabel || 'Enviar',
    /* Texto plano, no HTML: `FormularioDinamico` lo muestra interpolado
       dentro de <Alerta>, no con dangerouslySetInnerHTML — para un mensaje
       de una o dos frases no vale la pena abrir esa puerta. */
    mensajeConfirmacion: form.confirmationMessage
      ? convertLexicalToHTML({ data: form.confirmationMessage })
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      : 'Gracias, recibimos tu respuesta.',
  }
}

const aBloque = (bloque: NonNullable<PaginaDoc['contenido']>[number]): Bloque | null => {
  switch (bloque.blockType) {
    case 'texto':
      return { tipo: 'texto', html: convertLexicalToHTML({ data: bloque.contenido }) }
    case 'imagen': {
      const imagen = aImagen(bloque.imagen)
      if (!imagen) return null
      return { tipo: 'imagen', imagen, pie: bloque.pie ?? undefined }
    }
    case 'galeria': {
      const imagenes = (bloque.imagenes ?? []).map(aImagen).filter((i): i is Imagen => Boolean(i))
      if (imagenes.length === 0) return null
      return { tipo: 'galeria', titulo: bloque.titulo ?? undefined, imagenes }
    }
    case 'cita':
      return {
        tipo: 'cita',
        texto: bloque.texto,
        autor: bloque.autor ?? undefined,
        cargo: bloque.cargo ?? undefined,
      }
    case 'preguntas':
      return {
        tipo: 'preguntas',
        titulo: bloque.titulo ?? undefined,
        items: (bloque.items ?? []).map((i) => ({ pregunta: i.pregunta, respuesta: i.respuesta })),
      }
    case 'horarios':
      return {
        tipo: 'horarios',
        titulo: bloque.titulo ?? undefined,
        filas: (bloque.filas ?? []).map((f) => ({ dia: f.dia, horario: f.horario })),
      }
    case 'llamada':
      return {
        tipo: 'llamada',
        titulo: bloque.titulo,
        texto: bloque.texto ?? undefined,
        enlace: bloque.enlace,
        textoEnlace: bloque.textoEnlace ?? 'Ver más',
        externo: bloque.externo ?? false,
      }
    case 'video': {
      const video = bloque.video
      if (!video || typeof video !== 'object') return null
      return { tipo: 'video', idYoutube: video.idYoutube, titulo: video.titulo }
    }
    case 'formulario': {
      const formulario = bloque.formulario
      if (!formulario || typeof formulario !== 'object') return null
      return { tipo: 'formulario', form: aFormulario(formulario) }
    }
    case 'separador':
      return { tipo: 'separador' }
    default:
      return null
  }
}

export type PaginaCompleta = {
  titulo: string
  slug: string
  portada?: Imagen
  bloques: Bloque[]
  seo: MetaSEO
}

export const obtenerPaginaPorSlug = async (
  slug: string,
  vistaPrevia = false,
): Promise<PaginaCompleta | null> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'paginas',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
    ...opcionesDeAcceso(vistaPrevia),
  })
  const doc = resultado.docs[0]
  if (!doc) return null

  return {
    titulo: doc.titulo,
    slug: doc.slug,
    portada: aImagen(doc.portada),
    bloques: (doc.contenido ?? []).map(aBloque).filter((b): b is Bloque => b !== null),
    seo: aSEO(doc.seo, doc.titulo, doc.resumen, doc.portada),
  }
}

export const listarSlugsDePaginas = async (): Promise<string[]> => {
  const payload = await obtenerPayload()
  const resultado = await payload.find({
    collection: 'paginas',
    overrideAccess: false,
    depth: 0,
    limit: 200,
    select: { slug: true },
  })
  return resultado.docs.map((d) => d.slug)
}

/* --- Destacados de portada -------------------------------------------------- */

export const listarDestacadosVigentes = async (): Promise<Destacado[]> => {
  const payload = await obtenerPayload()
  const ahora = new Date().toISOString()
  const resultado = await payload.find({
    collection: 'destacados',
    overrideAccess: false,
    depth: 1,
    sort: 'orden',
    limit: 5,
    where: {
      and: [
        { activo: { equals: true } },
        { or: [{ vigenciaDesde: { exists: false } }, { vigenciaDesde: { less_than_equal: ahora } }] },
        { or: [{ vigenciaHasta: { exists: false } }, { vigenciaHasta: { greater_than_equal: ahora } }] },
      ],
    },
  })

  return resultado.docs
    .map((doc) => {
      const imagen = aImagen(doc.imagen)
      if (!imagen) return null
      const destacado: Destacado = {
        id: String(doc.id),
        titulo: doc.titulo,
        bajada: doc.bajada ?? undefined,
        imagen,
        enlace: doc.enlace,
        externo: doc.externo ?? false,
        textoEnlace: doc.textoEnlace ?? undefined,
      }
      return destacado
    })
    .filter((d): d is Destacado => d !== null)
}

/* --- Sitio: navegación, pie de página, ajustes ------------------------------ */

type EnlaceCrudo = {
  etiqueta: string
  href: string
  externo?: boolean | null
  hijos?: EnlaceCrudo[] | null
}

/**
 * Sirve a las tres listas de enlaces del panel —menú, sub-ítems y enlaces
 * legales—, que comparten los mismos campos (`camposEnlace`).
 *
 * `hijos` se omite cuando queda vacío en vez de mandarse como `[]`: es lo que
 * deja a la cabecera decidir entre pintar un enlace suelto o un desplegable
 * con una sola comprobación, sin tener que distinguir «sin hijos» de «lista
 * vacía». Un ítem con la lista de sub-ítems abierta pero sin nada dentro se
 * comporta como lo que es, un enlace normal.
 */
const aItemsNavegacion = (items: EnlaceCrudo[] | null | undefined): ItemNavegacion[] =>
  (items ?? []).map((item) => {
    const hijos = aItemsNavegacion(item.hijos)
    return {
      etiqueta: item.etiqueta,
      href: item.href,
      externo: item.externo ?? false,
      ...(hijos.length > 0 ? { hijos } : {}),
    }
  })

/**
 * Datos del sitio, en la misma forma que `PageShell.DatosSitio`. Si un
 * global todavía no se ha guardado desde el panel, cada pieza cae a
 * `SITIO_DEMO` por separado — un campo vacío no debe dejar el sitio entero
 * sin navbar.
 */
export const obtenerDatosSitio = async (): Promise<DatosSitio> => {
  const payload = await obtenerPayload()
  const [navegacion, pie, ajustes] = await Promise.all([
    payload.findGlobal({ slug: 'navegacion', overrideAccess: false, depth: 0 }),
    payload.findGlobal({ slug: 'pie-de-pagina', overrideAccess: false, depth: 0 }),
    payload.findGlobal({ slug: 'ajustes-del-sitio', overrideAccess: false, depth: 0 }),
  ])

  const items = aItemsNavegacion(navegacion.items)
  const enlacesLegales = aItemsNavegacion(pie.enlacesLegales)

  /* `CLAVES_RED` sale del mismo objeto que dibuja los íconos: sumar una red
     es tocar `MARCAS_SOCIALES` y el campo del global, y este bucle la recoge
     sin que haya que acordarse de nada más. */
  const redes: DatosSitio['redes'] = {}
  for (const clave of CLAVES_RED) {
    const url = ajustes.redes?.[clave]
    if (url) redes[clave] = url
  }

  return {
    navegacion: items.length > 0 ? items : SITIO_DEMO.navegacion,
    direccion: ajustes.direccion || SITIO_DEMO.direccion,
    telefono: ajustes.telefono || SITIO_DEMO.telefono,
    correo: ajustes.correo || SITIO_DEMO.correo,
    redes: Object.keys(redes).length > 0 ? redes : SITIO_DEMO.redes,
    enlacesLegales: enlacesLegales.length > 0 ? enlacesLegales : SITIO_DEMO.enlacesLegales,
  }
}

/* --- Portada ---------------------------------------------------------------- */

const esClaveIcono = (valor: unknown): valor is ClaveIconoAcceso =>
  typeof valor === 'string' && valor in ICONOS_ACCESO

export const obtenerPortada = async (): Promise<DatosPortada> => {
  const payload = await obtenerPayload()
  const portada = await payload.findGlobal({ slug: 'portada', overrideAccess: false, depth: 0 })

  const accesos: AccesoPortada[] = (portada.accesos ?? []).map((acceso) => ({
    titulo: acceso.titulo,
    descripcion: acceso.descripcion ?? undefined,
    href: acceso.href,
    externo: acceso.externo ?? false,
    /* El `select` del panel no puede entregar otra cosa, pero el documento sí
       —una siembra vieja, una edición a mano en la base— y un icono que este
       registro no conoce tumbaría el render de la portada completa. */
    icono: esClaveIcono(acceso.icono) ? acceso.icono : 'info',
  }))

  return {
    accesos: accesos.length > 0 ? accesos : PORTADA_POR_DEFECTO.accesos,
    tituloNoticias: portada.tituloNoticias || PORTADA_POR_DEFECTO.tituloNoticias,
    tituloRecintos: portada.tituloRecintos || PORTADA_POR_DEFECTO.tituloRecintos,
  }
}

/* --- SEO -------------------------------------------------------------------- */

export type MetaSEO = { titulo: string; descripcion?: string; imagen?: Imagen }

type CampoSEO = { metaTitulo?: string | null; metaDescripcion?: string | null; imagenCompartir?: unknown } | null | undefined

const aSEO = (
  seo: CampoSEO,
  tituloRespaldo: string,
  descripcionRespaldo: string | null | undefined,
  imagenRespaldo: unknown,
): MetaSEO => ({
  titulo: seo?.metaTitulo || tituloRespaldo,
  descripcion: seo?.metaDescripcion || descripcionRespaldo || undefined,
  imagen: aImagen(seo?.imagenCompartir) ?? aImagen(imagenRespaldo),
})

/* --- Buscador ---------------------------------------------------------------- */

export type ResultadoBusqueda = { tipo: 'noticia' | 'recinto' | 'pagina'; titulo: string; href: string; extracto?: string }

export const buscar = async (consulta: string): Promise<ResultadoBusqueda[]> => {
  if (!consulta.trim()) return []
  const payload = await obtenerPayload()
  const condicion = { contains: consulta }

  const [noticias, recintos, paginas] = await Promise.all([
    payload.find({
      collection: 'noticias',
      overrideAccess: false,
      depth: 0,
      limit: 8,
      where: { or: [{ titulo: condicion }, { bajada: condicion }] },
    }),
    payload.find({
      collection: 'recintos',
      overrideAccess: false,
      depth: 0,
      limit: 8,
      where: { or: [{ nombre: condicion }, { direccion: condicion }] },
    }),
    payload.find({
      collection: 'paginas',
      overrideAccess: false,
      depth: 0,
      limit: 8,
      where: { or: [{ titulo: condicion }, { resumen: condicion }] },
    }),
  ])

  return [
    ...noticias.docs.map((d) => ({
      tipo: 'noticia' as const,
      titulo: d.titulo,
      href: `/noticias/${d.slug}`,
      extracto: d.bajada ?? undefined,
    })),
    ...recintos.docs.map((d) => ({
      tipo: 'recinto' as const,
      titulo: d.nombre,
      href: `/recintos/${d.slug}`,
      extracto: d.direccion,
    })),
    ...paginas.docs.map((d) => ({
      tipo: 'pagina' as const,
      titulo: d.titulo,
      href: `/${d.slug}`,
      extracto: d.resumen ?? undefined,
    })),
  ]
}
