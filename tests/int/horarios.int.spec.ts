import { describe, expect, it } from 'vitest'

import { estadoDe, type DiaHorario } from '@/lib/horarios'

/* Piscina municipal: lunes a viernes de 08:00 a 21:00, sábado de 09:00 a 14:00
   y domingo cerrada. */
const PISCINA: DiaHorario[] = [
  { dia: 1, tramos: [{ inicio: '08:00', fin: '21:00' }] },
  { dia: 2, tramos: [{ inicio: '08:00', fin: '21:00' }] },
  { dia: 3, tramos: [{ inicio: '08:00', fin: '21:00' }] },
  { dia: 4, tramos: [{ inicio: '08:00', fin: '21:00' }] },
  { dia: 5, tramos: [{ inicio: '08:00', fin: '21:00' }] },
  { dia: 6, tramos: [{ inicio: '09:00', fin: '14:00' }] },
]

/**
 * Instante UTC que corresponde a una hora dada de Santiago.
 * En agosto Chile está en UTC-4, así que 15:00 UTC son las 11:00 locales.
 */
const enSantiago = (iso: string) => new Date(iso)

describe('estado en vivo de un recinto', () => {
  it('dice hasta cuándo está abierto', () => {
    // Martes 4 de agosto de 2026, 15:00 UTC = 11:00 en Santiago.
    const estado = estadoDe(PISCINA, enSantiago('2026-08-04T15:00:00Z'))
    expect(estado.clave).toBe('abierto')
    expect(estado.etiqueta).toBe('Abierto · cierra 21:00')
  })

  it('avisa cuando quedan menos de 60 minutos', () => {
    // Martes, 23:40 UTC = 19:40 en Santiago: quedan 80 min, todavía no avisa.
    expect(estadoDe(PISCINA, enSantiago('2026-08-04T23:40:00Z')).clave).toBe('abierto')

    // Martes, 00:30 UTC del día 5 = 20:30 del martes en Santiago: quedan 30.
    const porCerrar = estadoDe(PISCINA, enSantiago('2026-08-05T00:30:00Z'))
    expect(porCerrar.clave).toBe('por-cerrar')
    expect(porCerrar.etiqueta).toBe('Cierra en 30 min')
  })

  it('indica la próxima apertura del mismo día', () => {
    // Martes, 10:00 UTC = 06:00 en Santiago, antes de abrir.
    const estado = estadoDe(PISCINA, enSantiago('2026-08-04T10:00:00Z'))
    expect(estado.clave).toBe('cerrado')
    expect(estado.etiqueta).toBe('Cerrado · abre hoy 08:00')
  })

  it('salta al día siguiente cuando ya cerró', () => {
    // Martes, 02:00 UTC del día 5 = 22:00 del martes en Santiago.
    const estado = estadoDe(PISCINA, enSantiago('2026-08-05T02:00:00Z'))
    expect(estado.etiqueta).toBe('Cerrado · abre mañana 08:00')
  })

  it('nombra el día cuando la próxima apertura no es mañana', () => {
    // Domingo 9 de agosto, 15:00 UTC = 11:00 en Santiago. Domingo no abre.
    const estado = estadoDe(PISCINA, enSantiago('2026-08-09T15:00:00Z'))
    expect(estado.etiqueta).toBe('Cerrado · abre mañana 08:00')

    // Sábado 8 a las 20:00 locales: ya cerró y el domingo no hay tramos.
    const finDeSemana = estadoDe(PISCINA, enSantiago('2026-08-09T00:00:00Z'))
    expect(finDeSemana.etiqueta).toBe('Cerrado · abre lunes 08:00')
  })

  it('no inventa un estado si no hay horario cargado', () => {
    expect(estadoDe([], enSantiago('2026-08-04T15:00:00Z'))).toEqual({
      clave: 'cerrado',
      etiqueta: 'Sin horario publicado',
    })
  })
})
