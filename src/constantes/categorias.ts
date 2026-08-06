/**
 * Catálogo de categorías de noticias — fuente única.
 *
 * Sin JSX ni imports de React a propósito: este archivo lo importan tanto
 * `componentes/categorias.ts` (que le suma tinta, tinte e icono) como los
 * colecciones de Payload en `src/payload/`, que corren en Node y no deben
 * arrastrar componentes de interfaz solo para leer una etiqueta.
 *
 * Los seis valores son cerrados a propósito: cada uno tiene una tinta
 * auditada contra WCAG AA en `globals.css` (`--cat-*`). No es una lista libre
 * que un editor pueda ampliar desde el panel — una categoría nueva no tendría
 * color ni ícono y caería al respaldo neutro de `categoriaDe()`. Añadir una
 * categoría es una decisión de diseño, no una tarea de contenido.
 */

export const CATEGORIAS_NOTICIA = [
  { clave: 'deportivo', etiqueta: 'Deportivo' },
  { clave: 'cultural', etiqueta: 'Cultural' },
  { clave: 'artistico', etiqueta: 'Artístico' },
  { clave: 'salud', etiqueta: 'Salud' },
  { clave: 'formativo', etiqueta: 'Formativo' },
  { clave: 'comunitario', etiqueta: 'Comunitario' },
] as const

export type ClaveCategoria = (typeof CATEGORIAS_NOTICIA)[number]['clave']

export const CLAVES_CATEGORIA: readonly ClaveCategoria[] = CATEGORIAS_NOTICIA.map((c) => c.clave)

export const ETIQUETA_CATEGORIA: Record<ClaveCategoria, string> = Object.fromEntries(
  CATEGORIAS_NOTICIA.map((c) => [c.clave, c.etiqueta]),
) as Record<ClaveCategoria, string>
