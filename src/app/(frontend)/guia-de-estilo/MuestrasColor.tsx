'use client'

import { useMontado } from '@/lib/cliente'
import { clasificar, contrasteTokens, tokenCss } from '@/lib/contraste'
import { cn } from '@/lib/cn'

/**
 * Muestra de color con su ratio **medido en vivo** desde la variable CSS.
 *
 * No está escrito a mano a propósito: un comentario que dice «4,61:1» sigue
 * diciéndolo cuando alguien cambia el hex. Leyéndolo del DOM, la guía miente
 * el día que el token cambie, que es justo cuando hace falta enterarse.
 */

type Props = {
  token: string
  /** Fondo contra el que se mide el token. Casi siempre --background o --card. */
  sobre?: string
  nota?: string
  /**
   * El token es una superficie: se mide el texto que va **encima**, y hay que
   * decir cuál. Asumir `--foreground` sería el error clásico: sobre el campo
   * violeta el texto es blanco, y medir el gris oscuro daría 1,71:1 y haría
   * ver como reprobado un par que en realidad da 10,24:1.
   */
  texto?: string
}

export const MuestraColor = ({ token, sobre = '--background', nota, texto }: Props) => {
  /* Los valores se leen del DOM ya pintado, así que no existen en el servidor. */
  const montado = useMontado()
  const datos = montado
    ? {
        hex: tokenCss(token),
        ratio: texto ? contrasteTokens(texto, token) : contrasteTokens(token, sobre),
      }
    : null

  const clase = datos ? clasificar(datos.ratio) : null

  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-[var(--radius-sm)] border p-3">
      <span
        className="border-border h-12 w-12 shrink-0 rounded-[var(--radius-sm)] border"
        style={{ backgroundColor: `var(${token})` }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="truncate font-mono text-[13px] font-semibold">{token}</p>
        <p className="text-muted-foreground tabular font-mono text-[13px] uppercase">
          {datos?.hex ?? '—'}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px]">
          <span className="tabular font-semibold">{datos ? `${datos.ratio.toFixed(2)}:1` : '—'}</span>
          {clase ? (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                clase === 'AA texto' && 'bg-exito-suave text-exito',
                clase === 'AA grande' && 'bg-aviso-suave text-aviso',
                clase === 'AA interfaz' && 'bg-info-suave text-info',
                clase === 'insuficiente' && 'bg-destructive-suave text-destructive',
              )}
            >
              {clase}
            </span>
          ) : null}
        </p>
        {nota ? <p className="text-muted-foreground mt-1 text-[13px]">{nota}</p> : null}
      </div>
    </div>
  )
}

export const RejillaColor = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
)
