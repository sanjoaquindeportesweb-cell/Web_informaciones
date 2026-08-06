import type { Bloque } from '@/bloques/Bloques'
import type { Destacado, Recinto, Noticia } from '@/tipos'

/**
 * Contenido de muestra para la guía de estilo.
 *
 * Los nombres de recintos y actividades son verosímiles para San Joaquín, pero
 * **las direcciones, teléfonos y aforos van con marcador evidente**. Un dato
 * oficial inventado sobrevive al prototipo, termina publicado y alguien acaba
 * yendo a una dirección que no existe.
 */

const imagen = (archivo: string, alt: string) => ({
  url: `/muestras/${archivo}.webp`,
  alt,
  ancho: 1600,
  alto: 900,
})

export const NOTICIAS_EJEMPLO: Noticia[] = [
  {
    slug: 'liga-femenina-2026',
    titulo: 'La Liga Femenina de Fútbol cerró su temporada con récord de equipos',
    bajada:
      'Dieciséis clubes de la comuna participaron en la final disputada en el Estadio Municipal, con público en las graderías durante toda la jornada.',
    categoria: 'deportivo',
    publicadaEn: '2026-08-02T14:00:00Z',
    portada: imagen('liga', 'Jugadoras celebrando en la cancha del Estadio Municipal'),
  },
  {
    slug: 'escuelas-deportivas-inscripciones',
    titulo: 'Abren las inscripciones para las escuelas deportivas de primavera',
    bajada:
      'Habrá cupos en natación, básquetbol, atletismo y gimnasia para niñas y niños de 6 a 14 años.',
    categoria: 'formativo',
    publicadaEn: '2026-07-28T12:00:00Z',
    portada: imagen('escuela', 'Grupo de niñas y niños entrenando en el gimnasio municipal'),
  },
  {
    slug: 'corrida-familiar',
    titulo: 'La corrida familiar reunió a más de mil vecinas y vecinos',
    bajada: 'El recorrido de cinco kilómetros pasó por los cuatro parques de la comuna.',
    categoria: 'comunitario',
    publicadaEn: '2026-07-19T09:30:00Z',
    portada: imagen('corrida', 'Corredores en la partida de la corrida familiar'),
  },
  {
    slug: 'piscina-temperada-horario',
    titulo: 'La piscina temperada amplía su horario durante agosto',
    bajada: 'Abrirá también los sábados por la mañana para natación libre.',
    categoria: 'salud',
    publicadaEn: '2026-07-11T16:45:00Z',
    portada: imagen('piscina', 'Vista de la piscina temperada municipal'),
  },
]

export const RECINTOS_EJEMPLO: Recinto[] = [
  {
    slug: 'estadio-municipal',
    nombre: 'Estadio Municipal',
    direccion: '[dirección por confirmar], San Joaquín',
    disciplinas: ['Fútbol', 'Atletismo'],
    aforo: 3515,
    portada: imagen('estadio', 'Cancha y graderías del Estadio Municipal'),
    urlReserva: 'https://ejemplo.plataforma.cl/canchas',
    horarios: [
      { dia: 1, tramos: [{ inicio: '08:00', fin: '21:00' }] },
      { dia: 2, tramos: [{ inicio: '08:00', fin: '21:00' }] },
      { dia: 3, tramos: [{ inicio: '08:00', fin: '21:00' }] },
      { dia: 4, tramos: [{ inicio: '08:00', fin: '21:00' }] },
      { dia: 5, tramos: [{ inicio: '08:00', fin: '21:00' }] },
      { dia: 6, tramos: [{ inicio: '09:00', fin: '14:00' }] },
    ],
  },
  {
    slug: 'piscina-temperada',
    nombre: 'Piscina Temperada Municipal',
    direccion: '[dirección por confirmar], San Joaquín',
    disciplinas: ['Natación', 'Hidrogimnasia'],
    portada: imagen('piscina', 'Piscina temperada municipal vista desde el borde'),
    horarios: [
      { dia: 1, tramos: [{ inicio: '07:00', fin: '20:00' }] },
      { dia: 2, tramos: [{ inicio: '07:00', fin: '20:00' }] },
      { dia: 3, tramos: [{ inicio: '07:00', fin: '20:00' }] },
      { dia: 4, tramos: [{ inicio: '07:00', fin: '20:00' }] },
      { dia: 5, tramos: [{ inicio: '07:00', fin: '20:00' }] },
    ],
  },
  {
    slug: 'gimnasio-municipal',
    nombre: 'Gimnasio Municipal',
    direccion: '[dirección por confirmar], San Joaquín',
    disciplinas: ['Básquetbol', 'Vóleibol', 'Gimnasia'],
    portada: imagen('gimnasio', 'Cancha techada del gimnasio municipal'),
    urlReserva: 'https://ejemplo.plataforma.cl/canchas',
    horarios: [
      { dia: 1, tramos: [{ inicio: '09:00', fin: '22:00' }] },
      { dia: 3, tramos: [{ inicio: '09:00', fin: '22:00' }] },
      { dia: 5, tramos: [{ inicio: '09:00', fin: '22:00' }] },
    ],
  },
]

export const DESTACADOS_EJEMPLO: Destacado[] = [
  {
    id: 'd1',
    titulo: 'Inscríbete en las escuelas deportivas de primavera',
    bajada: 'Natación, básquetbol, atletismo y gimnasia para niñas y niños de 6 a 14 años.',
    imagen: imagen('escuela', 'Niñas y niños entrenando en el gimnasio municipal'),
    enlace: 'https://ejemplo.plataforma.cl/talleres',
    externo: true,
    textoEnlace: 'Ver los talleres',
  },
  {
    id: 'd2',
    titulo: 'La piscina temperada amplía su horario',
    bajada: 'Durante agosto abre también los sábados por la mañana.',
    imagen: imagen('piscina', 'Piscina temperada municipal'),
    enlace: '/noticias/piscina-temperada-horario',
    textoEnlace: 'Leer la noticia',
  },
  {
    id: 'd3',
    titulo: 'Arrienda una cancha para tu club',
    bajada: 'Revisa la disponibilidad del Estadio y del Gimnasio Municipal.',
    imagen: imagen('estadio', 'Cancha del Estadio Municipal'),
    enlace: 'https://ejemplo.plataforma.cl/canchas',
    externo: true,
    textoEnlace: 'Ver disponibilidad',
  },
]

export const GALERIA_EJEMPLO = [
  imagen('liga', 'Equipo celebrando el título de la Liga Femenina'),
  imagen('corrida', 'Partida de la corrida familiar'),
  imagen('escuela', 'Entrenamiento de la escuela de básquetbol'),
  imagen('gimnasio', 'Partido de vóleibol en el gimnasio municipal'),
]

export const BLOQUES_EJEMPLO: Bloque[] = [
  {
    tipo: 'texto',
    html: `<p>La Corporación Municipal de Deportes administra los recintos deportivos de la comuna y organiza las actividades que se realizan en ellos durante todo el año.</p>
      <h2>Qué hacemos</h2>
      <p>Coordinamos las escuelas deportivas, las ligas comunales y el uso de los recintos por parte de clubes y organizaciones vecinales.</p>
      <ul><li>Escuelas deportivas para niñas, niños y jóvenes.</li><li>Ligas y campeonatos comunales.</li><li>Arriendo de canchas y recintos.</li></ul>`,
  },
  { tipo: 'separador' },
  {
    tipo: 'cita',
    texto:
      'El deporte comunal no se mide en medallas, se mide en cuánta gente del barrio se mueve cada semana.',
    autor: '[nombre por confirmar]',
    cargo: 'Dirección de la Corporación',
  },
  {
    tipo: 'preguntas',
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
      {
        pregunta: '¿Puedo usar la piscina sin inscribirme a un taller?',
        respuesta:
          'Sí. Hay horarios de natación libre; revisa el horario vigente en la ficha de la piscina.',
      },
    ],
  },
  {
    tipo: 'horarios',
    titulo: 'Horario de atención de oficinas',
    filas: [
      { dia: 'Lunes a jueves', horario: '08:30 – 17:30' },
      { dia: 'Viernes', horario: '08:30 – 16:30' },
      { dia: 'Sábado y domingo', horario: 'Cerrado' },
    ],
  },
  {
    tipo: 'llamada',
    titulo: '¿Quieres inscribirte en un taller?',
    texto: 'Las inscripciones y los pagos se hacen en la plataforma de trámites de la Corporación.',
    enlace: 'https://ejemplo.plataforma.cl/talleres',
    textoEnlace: 'Ir a la plataforma',
    externo: true,
  },
]
