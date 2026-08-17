/**
 * Siembra de contenido de ejemplo.
 *
 * Se ejecuta con `pnpm sembrar`. Reutiliza los mismos nombres, slugs y
 * fotografías de muestra que ya vive en `src/datos-ejemplo.ts` —el que usa
 * la guía de estilo—, así que el portal real y la guía muestran las mismas
 * piezas reconocibles en vez de dos juegos de datos de mentira distintos.
 *
 * Es idempotente: busca por slug (o por título donde no hay slug) antes de
 * crear, así que correrlo dos veces no duplica nada. Los datos oficiales
 * —dirección, teléfono— van con marcador evidente, nunca inventados: ver
 * `datos-ejemplo.ts` para la razón completa.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload, type Where } from 'payload'

import config from '@/payload.config'
import { URL_TALLERES } from '@/constantes/enlaces-externos'
import { PORTADA_POR_DEFECTO } from '@/globals/Portada'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const muestra = (archivo: string) => path.resolve(dirname, '../../public/muestras', `${archivo}.webp`)

/** Documento Lexical mínimo válido: un párrafo por cada texto que llega. */
const parrafos = (...textos: string[]) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: textos.map((texto) => ({
      type: 'paragraph',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        { type: 'text', text: texto, format: 0, detail: 0, mode: 'normal' as const, style: '', version: 1 },
      ],
    })),
  },
})

const encontrarOCrear = async <T extends Record<string, unknown>>(
  payload: Payload,
  collection: Parameters<Payload['create']>[0]['collection'],
  buscarPor: Where,
  data: T,
  filePath?: string,
): Promise<{ id: string | number; nuevo: boolean }> => {
  const existente = await payload.find({ collection, where: buscarPor, limit: 1, overrideAccess: true })
  if (existente.docs[0]) return { id: existente.docs[0].id, nuevo: false }

  const creado = await payload.create({ collection, data, filePath, overrideAccess: true })
  return { id: creado.id, nuevo: true }
}

const sembrar = async () => {
  const payload = await getPayload({ config })
  payload.logger.info('Sembrando contenido de ejemplo…')

  /* --- Medios ------------------------------------------------------------ */
  const medios: Record<string, { id: string | number }> = {}
  const FOTOS = [
    ['estadio', 'Cancha y graderías del Estadio Municipal'],
    ['piscina', 'Vista de la piscina temperada municipal'],
    ['gimnasio', 'Cancha techada del gimnasio municipal'],
    ['liga', 'Jugadoras celebrando en la cancha del Estadio Municipal'],
    ['escuela', 'Grupo de niñas y niños entrenando en el gimnasio municipal'],
    ['corrida', 'Corredores en la partida de la corrida familiar'],
  ] as const

  for (const [archivo, alt] of FOTOS) {
    const { id } = await encontrarOCrear(
      payload,
      'media',
      { alt: { equals: alt } },
      { alt },
      muestra(archivo),
    )
    medios[archivo] = { id }
  }
  payload.logger.info(`Medios listos: ${Object.keys(medios).length}`)

  /* --- Video --------------------------------------------------------------- */
  const { id: idVideo } = await encontrarOCrear(
    payload,
    'videos',
    { idYoutube: { equals: 'aqz-KE-bpKQ' } },
    {
      titulo: 'Resumen de la Liga Femenina 2026',
      idYoutube: 'aqz-KE-bpKQ',
      descripcion: 'Los mejores momentos de la temporada de la Liga Femenina de Fútbol.',
    },
  )

  /* --- Noticias ------------------------------------------------------------ */
  const NOTICIAS = [
    {
      slug: 'liga-femenina-2026',
      titulo: 'La Liga Femenina de Fútbol cerró su temporada con récord de equipos',
      bajada:
        'Dieciséis clubes de la comuna participaron en la final disputada en el Estadio Municipal, con público en las graderías durante toda la jornada.',
      categoria: 'deportivo',
      publicadaEn: '2026-08-02T14:00:00.000Z',
      portada: medios.liga!.id,
      cuerpo: parrafos(
        'Dieciséis clubes de la comuna participaron en la final disputada en el Estadio Municipal, con público en las graderías durante toda la jornada.',
        'El equipo campeón recibió su trofeo de manos de la Corporación, que adelantó que la próxima temporada sumará dos categorías juveniles.',
      ),
    },
    {
      slug: 'escuelas-deportivas-inscripciones',
      titulo: 'Abren las inscripciones para las escuelas deportivas de primavera',
      bajada:
        'Habrá cupos en natación, básquetbol, atletismo y gimnasia para niñas y niños de 6 a 14 años.',
      categoria: 'formativo',
      publicadaEn: '2026-07-28T12:00:00.000Z',
      portada: medios.escuela!.id,
      cuerpo: parrafos(
        'Habrá cupos en natación, básquetbol, atletismo y gimnasia para niñas y niños de 6 a 14 años.',
        'Las inscripciones son gratuitas y se realizan por orden de llegada en la plataforma de trámites de la Corporación.',
      ),
    },
    {
      slug: 'corrida-familiar',
      titulo: 'La corrida familiar reunió a más de mil vecinas y vecinos',
      bajada: 'El recorrido de cinco kilómetros pasó por los cuatro parques de la comuna.',
      categoria: 'comunitario',
      publicadaEn: '2026-07-19T09:30:00.000Z',
      portada: medios.corrida!.id,
      cuerpo: parrafos('El recorrido de cinco kilómetros pasó por los cuatro parques de la comuna.'),
    },
    {
      slug: 'piscina-temperada-horario',
      titulo: 'La piscina temperada amplía su horario durante agosto',
      bajada: 'Abrirá también los sábados por la mañana para natación libre.',
      categoria: 'salud',
      publicadaEn: '2026-07-11T16:45:00.000Z',
      portada: medios.piscina!.id,
      cuerpo: parrafos('Abrirá también los sábados por la mañana para natación libre, de 09:00 a 13:00.'),
    },
  ]

  for (const noticia of NOTICIAS) {
    await encontrarOCrear(
      payload,
      'noticias',
      { slug: { equals: noticia.slug } },
      { ...noticia, _status: 'published' },
    )
  }
  payload.logger.info(`Noticias listas: ${NOTICIAS.length}`)

  /* --- Recintos ---------------------------------------------------------- */
  const RECINTOS = [
    {
      slug: 'estadio-municipal',
      nombre: 'Estadio Municipal',
      direccion: '[dirección por confirmar], San Joaquín',
      disciplinas: ['Fútbol', 'Atletismo'],
      aforo: 3515,
      portada: medios.estadio!.id,
      urlReserva: 'https://ejemplo.plataforma.cl/canchas',
      horarios: [
        { dia: '1', tramos: [{ inicio: '08:00', fin: '21:00' }] },
        { dia: '2', tramos: [{ inicio: '08:00', fin: '21:00' }] },
        { dia: '3', tramos: [{ inicio: '08:00', fin: '21:00' }] },
        { dia: '4', tramos: [{ inicio: '08:00', fin: '21:00' }] },
        { dia: '5', tramos: [{ inicio: '08:00', fin: '21:00' }] },
        { dia: '6', tramos: [{ inicio: '09:00', fin: '14:00' }] },
      ],
    },
    {
      slug: 'piscina-temperada',
      nombre: 'Piscina Temperada Municipal',
      direccion: '[dirección por confirmar], San Joaquín',
      disciplinas: ['Natación', 'Hidrogimnasia'],
      portada: medios.piscina!.id,
      horarios: [
        { dia: '1', tramos: [{ inicio: '07:00', fin: '20:00' }] },
        { dia: '2', tramos: [{ inicio: '07:00', fin: '20:00' }] },
        { dia: '3', tramos: [{ inicio: '07:00', fin: '20:00' }] },
        { dia: '4', tramos: [{ inicio: '07:00', fin: '20:00' }] },
        { dia: '5', tramos: [{ inicio: '07:00', fin: '20:00' }] },
      ],
    },
    {
      slug: 'gimnasio-municipal',
      nombre: 'Gimnasio Municipal',
      direccion: '[dirección por confirmar], San Joaquín',
      disciplinas: ['Básquetbol', 'Vóleibol', 'Gimnasia'],
      portada: medios.gimnasio!.id,
      urlReserva: 'https://ejemplo.plataforma.cl/canchas',
      horarios: [
        { dia: '1', tramos: [{ inicio: '09:00', fin: '22:00' }] },
        { dia: '3', tramos: [{ inicio: '09:00', fin: '22:00' }] },
        { dia: '5', tramos: [{ inicio: '09:00', fin: '22:00' }] },
      ],
    },
  ]

  for (const recinto of RECINTOS) {
    await encontrarOCrear(
      payload,
      'recintos',
      { slug: { equals: recinto.slug } },
      { ...recinto, _status: 'published' },
    )
  }
  payload.logger.info(`Recintos listos: ${RECINTOS.length}`)

  /* --- Galería --------------------------------------------------------------- */
  await encontrarOCrear(
    payload,
    'galerias',
    { slug: { equals: 'actividades-de-la-corporacion' } },
    {
      titulo: 'Actividades de la Corporación',
      slug: 'actividades-de-la-corporacion',
      descripcion: 'Fotos de campeonatos, escuelas deportivas y actividades comunitarias.',
      portada: medios.liga!.id,
      imagenes: [medios.liga!.id, medios.corrida!.id, medios.escuela!.id, medios.gimnasio!.id],
      _status: 'published',
    },
  )
  payload.logger.info('Galería lista')

  /* --- Destacados de portada ------------------------------------------------- */
  const DESTACADOS = [
    {
      titulo: 'Inscríbete en las escuelas deportivas de primavera',
      bajada: 'Natación, básquetbol, atletismo y gimnasia para niñas y niños de 6 a 14 años.',
      imagen: medios.escuela!.id,
      enlace: URL_TALLERES,
      externo: true,
      textoEnlace: 'Ver los talleres',
      orden: 1,
    },
    {
      titulo: 'La piscina temperada amplía su horario',
      bajada: 'Durante agosto abre también los sábados por la mañana.',
      imagen: medios.piscina!.id,
      enlace: '/noticias/piscina-temperada-horario',
      textoEnlace: 'Leer la noticia',
      orden: 2,
    },
    {
      titulo: 'Arrienda una cancha para tu club',
      bajada: 'Revisa la disponibilidad del Estadio y del Gimnasio Municipal.',
      imagen: medios.estadio!.id,
      enlace: 'https://ejemplo.plataforma.cl/canchas',
      externo: true,
      textoEnlace: 'Ver disponibilidad',
      orden: 3,
    },
  ]

  for (const destacado of DESTACADOS) {
    await encontrarOCrear(payload, 'destacados', { titulo: { equals: destacado.titulo } }, destacado)
  }
  payload.logger.info(`Destacados listos: ${DESTACADOS.length}`)

  /* --- Página institucional, con varios bloques ------------------------------ */
  await encontrarOCrear(
    payload,
    'paginas',
    { slug: { equals: 'quienes-somos' } },
    {
      titulo: 'Quiénes somos',
      slug: 'quienes-somos',
      resumen:
        'La Corporación Municipal de Deportes administra los recintos deportivos de la comuna y organiza las actividades que se realizan en ellos.',
      portada: medios.estadio!.id,
      _status: 'published',
      contenido: [
        {
          blockType: 'texto',
          contenido: parrafos(
            'La Corporación Municipal de Deportes administra los recintos deportivos de la comuna y organiza las actividades que se realizan en ellos durante todo el año.',
            'Coordinamos las escuelas deportivas, las ligas comunales y el uso de los recintos por parte de clubes y organizaciones vecinales.',
          ),
        },
        { blockType: 'separador' },
        {
          blockType: 'cita',
          texto:
            'El deporte comunal no se mide en medallas, se mide en cuánta gente del barrio se mueve cada semana.',
          autor: '[nombre por confirmar]',
          cargo: 'Dirección de la Corporación',
        },
        {
          blockType: 'preguntas',
          titulo: 'Preguntas frecuentes',
          items: [
            {
              pregunta: '¿Cómo arriendo una cancha?',
              respuesta:
                'El arriendo se hace en la plataforma de trámites de la Corporación. Desde la ficha de cada recinto hay un enlace directo.',
            },
            {
              pregunta: '¿Las escuelas deportivas tienen costo?',
              respuesta:
                'Las escuelas deportivas municipales son gratuitas para vecinas y vecinos de la comuna. Los cupos se asignan por orden de inscripción.',
            },
          ],
        },
        {
          blockType: 'horarios',
          titulo: 'Horario de atención de oficinas',
          filas: [
            { dia: 'Lunes a jueves', horario: '08:30 – 17:30' },
            { dia: 'Viernes', horario: '08:30 – 16:30' },
            { dia: 'Sábado y domingo', horario: 'Cerrado' },
          ],
        },
        { blockType: 'video', video: idVideo },
        {
          blockType: 'llamada',
          titulo: '¿Quieres inscribirte en un taller?',
          texto: 'Las inscripciones y los pagos se hacen en la plataforma de trámites de la Corporación.',
          enlace: URL_TALLERES,
          textoEnlace: 'Ir a la plataforma',
          externo: true,
        },
      ],
    },
  )
  payload.logger.info('Página «Quiénes somos» lista')

  /* --- Globales -------------------------------------------------------------- */
  await payload.updateGlobal({
    slug: 'navegacion',
    overrideAccess: true,
    data: {
      items: [
        { etiqueta: 'Noticias', href: '/noticias' },
        { etiqueta: 'Recintos', href: '/recintos' },
        { etiqueta: 'Galerías', href: '/galerias' },
        { etiqueta: 'Talleres', href: URL_TALLERES, externo: true },
        { etiqueta: 'Quiénes somos', href: '/quienes-somos' },
        { etiqueta: 'Contacto', href: '/contacto' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'pie-de-pagina',
    overrideAccess: true,
    data: {
      // Los tres accesos institucionales, en dos líneas y hacia el organismo
      // CM253. Mismas direcciones que el subdominio de talleres.
      enlacesLegales: [
        {
          etiqueta: 'Plataforma',
          titulo: 'Ley de Lobby',
          href: 'https://www.leylobby.gob.cl/instituciones/CM253',
          externo: true,
        },
        {
          etiqueta: 'Solicitar información',
          titulo: 'Ley de Transparencia',
          href: 'https://www.portaltransparencia.cl/PortalPdT/ingreso-sai-v2?idOrg=6828',
          externo: true,
        },
        {
          etiqueta: 'Transparencia activa',
          titulo: 'Ley de Transparencia',
          href: 'https://www.portaltransparencia.cl/PortalPdT/directorio-de-organismos-regulados/?org=CM253',
          externo: true,
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'ajustes-del-sitio',
    overrideAccess: true,
    data: {
      nombreCorporacion: 'Corporación Municipal de Deportes de San Joaquín',
      direccion: '[dirección por confirmar], San Joaquín',
      telefono: '[teléfono por confirmar]',
      correo: '[correo por confirmar]',
      redes: {
        facebook: 'https://www.facebook.com/sanjoaquindeportes/',
        instagram: 'https://www.instagram.com/deportessanjoaquin/',
      },
    },
  })

  /* La portada se siembra con exactamente lo que el componente mostraba
     cuando estos textos vivían en el código: el objetivo de la siembra es un
     entorno idéntico al que ya se conocía, no uno parecido. `PORTADA_POR_DEFECTO`
     es la misma constante que sirve de respaldo cuando el global está vacío. */
  await payload.updateGlobal({
    slug: 'portada',
    overrideAccess: true,
    data: PORTADA_POR_DEFECTO,
  })
  payload.logger.info('Globales listos: navegación, barra superior, ajustes del sitio, portada')

  payload.logger.info('Siembra completa.')
  process.exit(0)
}

/* `await` de nivel superior, no una promesa suelta: `payload run` hace
   `await import(este-archivo)`, y sin este `await` el import se resuelve en
   cuanto termina la parte síncrona del módulo — el proceso puede cerrarse
   antes de que la siembra, que es toda asíncrona, alcance a correr. */
try {
  await sembrar()
} catch (error) {
  console.error(error)
  process.exit(1)
}
