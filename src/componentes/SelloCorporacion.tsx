import Image from 'next/image'

import { cn } from '@/lib/cn'

/**
 * Sello de la Corporación.
 *
 * Logotipo oficial entregado por el cliente (`recursos/Logos/`), la variante
 * a color sobre fondo transparente: al llevar sus propios colores y no ser
 * monocromático, funciona igual sobre el campo violeta que sobre una tarjeta
 * blanca, sin necesitar una versión por fondo.
 */

export const SelloCorporacion = ({ className }: { className?: string }) => (
  <Image
    src="/marca/logo.png"
    alt="Corporación Municipal de Deportes de San Joaquín"
    width={512}
    height={512}
    priority
    className={cn('h-12 w-12 md:h-14 md:w-14', className)}
  />
)
