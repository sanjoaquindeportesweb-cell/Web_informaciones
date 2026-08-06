import type { ComponentType, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { IconoAlerta, IconoCheck, IconoInfo, type PropsIcono } from './Iconos'

/**
 * Estados de carga, vacío y aviso.
 *
 * Los tres colores semánticos van siempre acompañados de icono y de texto:
 * un mensaje que solo se distingue por ser rojo no existe para quien no
 * percibe ese rojo.
 */

/* --- Carga ---------------------------------------------------------------- */

export const Esqueleto = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'bg-muted relative overflow-hidden rounded-[var(--radius-sm)]',
      'motion-safe:after:absolute motion-safe:after:inset-0',
      'motion-safe:after:bg-gradient-to-r motion-safe:after:from-transparent motion-safe:after:via-white/60 motion-safe:after:to-transparent',
      'motion-safe:after:animate-[brillo_1.6s_infinite]',
      className,
    )}
    aria-hidden="true"
  />
)

export const EsqueletoTarjeta = () => (
  <div className="border-border bg-card rounded-[var(--radius)] border p-4">
    <Esqueleto className="mb-4 aspect-[16/10] w-full" />
    <Esqueleto className="mb-2 h-4 w-24" />
    <Esqueleto className="mb-2 h-6 w-full" />
    <Esqueleto className="h-6 w-2/3" />
  </div>
)

/**
 * Anuncia la carga a los lectores de pantalla. El esqueleto es puramente
 * visual, así que sin esto quien no ve la pantalla no sabe que algo viene.
 */
export const CargandoLista = ({ cantidad = 3 }: { cantidad?: number }) => (
  <>
    <p role="status" className="sr-only">
      Cargando contenido…
    </p>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <EsqueletoTarjeta key={i} />
      ))}
    </div>
  </>
)

/* --- Vacío ---------------------------------------------------------------- */

export const EstadoVacio = ({
  titulo,
  descripcion,
  Icono = IconoInfo,
  accion,
}: {
  titulo: string
  descripcion?: string
  Icono?: ComponentType<PropsIcono>
  accion?: ReactNode
}) => (
  <div className="border-border bg-card rounded-[var(--radius-lg)] border border-dashed px-6 py-14 text-center">
    <span className="bg-acento-suave text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
      <Icono className="text-[1.4rem]" />
    </span>
    <h3 className="font-display text-lg font-bold">{titulo}</h3>
    {descripcion ? (
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm">{descripcion}</p>
    ) : null}
    {accion ? <div className="mt-6 flex justify-center">{accion}</div> : null}
  </div>
)

/* --- Avisos ---------------------------------------------------------------- */

export type TonoAlerta = 'info' | 'exito' | 'aviso' | 'error'

const TONOS: Record<TonoAlerta, { caja: string; tinta: string; Icono: ComponentType<PropsIcono> }> =
  {
    info: { caja: 'bg-info-suave border-info/25', tinta: 'text-info', Icono: IconoInfo },
    exito: { caja: 'bg-exito-suave border-exito/25', tinta: 'text-exito', Icono: IconoCheck },
    aviso: { caja: 'bg-aviso-suave border-aviso/25', tinta: 'text-aviso', Icono: IconoAlerta },
    error: {
      caja: 'bg-destructive-suave border-destructive/25',
      tinta: 'text-destructive',
      Icono: IconoAlerta,
    },
  }

export const Alerta = ({
  tono = 'info',
  titulo,
  children,
  className,
}: {
  tono?: TonoAlerta
  titulo?: string
  children: ReactNode
  className?: string
}) => {
  const { caja, tinta, Icono } = TONOS[tono]

  return (
    <div
      /* Los errores se anuncian solos; el resto no interrumpe la lectura. */
      role={tono === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-[var(--radius)] border px-4 py-3 text-[15px]',
        caja,
        className,
      )}
    >
      <Icono className={cn('mt-0.5 shrink-0', tinta)} />
      <div>
        {titulo ? <p className="font-semibold">{titulo}</p> : null}
        <div className="text-foreground/90">{children}</div>
      </div>
    </div>
  )
}
