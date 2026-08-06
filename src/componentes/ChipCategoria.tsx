import { cn } from '@/lib/cn'
import { categoriaDe, type ClaveCategoria } from './categorias'

/**
 * Píldora de categoría.
 *
 * La tinta va en el icono y en el filete; el texto va en --foreground sobre el
 * tinte suave. Poner la tinta sobre su propio tinte es el error clásico: da
 * alrededor de 4:1 y no llega a AA.
 */

type Props = {
  categoria: ClaveCategoria | string
  tamano?: 'sm' | 'md'
  className?: string
}

export const ChipCategoria = ({ categoria, tamano = 'md', className }: Props) => {
  const { etiqueta, texto, fondo, Icono } = categoriaDe(categoria)

  return (
    <span
      className={cn(
        'text-foreground inline-flex items-center rounded-full font-semibold',
        fondo,
        tamano === 'sm' ? 'gap-1 px-2.5 py-1 text-xs' : 'gap-1.5 px-3 py-1.5 text-sm',
        className,
      )}
    >
      <Icono className={texto} />
      {etiqueta}
    </span>
  )
}

/**
 * Microetiqueta: fecha, sección, «En vivo». Va en la tinta de la categoría o
 * en --muted-foreground, nunca en el naranja institucional.
 */
export const Microetiqueta = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <span
    className={cn(
      'text-muted-foreground text-[11px] font-bold tracking-[0.14em] uppercase',
      className,
    )}
  >
    {children}
  </span>
)
