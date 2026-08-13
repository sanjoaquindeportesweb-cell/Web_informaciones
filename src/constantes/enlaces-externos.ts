/**
 * Enlaces a la plataforma de trámites de la Corporación.
 *
 * El portal es solo informativo: inscribirse a un taller o arrendar una cancha
 * ocurre fuera, en la plataforma de trámites. Esa URL aparecía copiada como
 * `https://ejemplo.plataforma.cl/talleres` en la navegación, la portada, la
 * siembra y la guía de estilo — cuatro sitios donde había que acordarse de
 * cambiarla. Vive aquí para que cambiarla sea una línea.
 *
 * Y ahora ni eso: sale de `NEXT_PUBLIC_URL_PLATAFORMA`. El respaldo es el
 * despliegue de *desarrollo* de la plataforma, que es lo correcto en `pnpm dev`
 * y lo que hay que pisar en producción — antes había que editar este archivo y
 * volver a desplegar el portal solo para apuntar a otro dominio, con lo que el
 * paso se olvidaba y los enlaces de talleres y canchas se quedaban mandando
 * vecinos al entorno de pruebas.
 *
 * El `urlReserva` de cada recinto no sale de aquí: es un campo del panel,
 * porque no todos los recintos se arriendan ni todos por la misma URL.
 */
const PLATAFORMA_POR_DEFECTO = 'https://dev.d5m354pj19g3o.amplifyapp.com'

/* Sin la barra final: las constantes de abajo la ponen, y un valor pegado del
   navegador la trae casi siempre — `…cl//talleres` no siempre resuelve. */
export const URL_PLATAFORMA = (
  process.env.NEXT_PUBLIC_URL_PLATAFORMA || PLATAFORMA_POR_DEFECTO
).replace(/\/+$/, '')

/** Inscripción a talleres y escuelas deportivas. */
export const URL_TALLERES = `${URL_PLATAFORMA}/talleres`

/**
 * Arriendo de canchas. La plataforma resuelve todo en una sola página con
 * selector —no hay URL por recinto—, así que este es el destino para
 * cualquiera. Se deja aquí como referencia; el `urlReserva` de cada recinto se
 * escribe en el panel, no en el código.
 */
export const URL_CANCHAS = `${URL_PLATAFORMA}/canchas`
