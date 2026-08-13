/**
 * Auditoría de contraste del sistema de diseño.
 *
 * Lee los tokens directamente de globals.css —la fuente de verdad— y comprueba
 * cada par texto/fondo que el sistema declara. Falla con código distinto de
 * cero, así que sirve de puerta en CI.
 *
 * Node puro, sin dependencias: una auditoría que se cae porque se rompió una
 * dependencia no es una auditoría.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CSS = resolve(RAIZ, 'src/app/(frontend)/globals.css')

/* --- Lectura de tokens ---------------------------------------------------- */

/**
 * Extrae `--nombre: valor` y resuelve las cadenas de `var(--otro)` hasta llegar
 * a un hex. Resolver varios niveles importa: --primary apunta a
 * --sj-naranja-600, y un resolutor de un solo salto lo dejaría sin valor.
 */
const leerTokens = (css) => {
  const crudos = new Map()
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi
  let m
  while ((m = re.exec(css)) !== null) {
    crudos.set(m[1], m[2].trim())
  }

  const resolver = (valor, saltos = 0) => {
    if (saltos > 10) return null
    const v = valor.trim()
    if (/^#[0-9a-f]{3,8}$/i.test(v)) return v
    const ref = v.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i)
    if (ref && crudos.has(ref[1])) return resolver(crudos.get(ref[1]), saltos + 1)
    return null
  }

  const tokens = new Map()
  for (const [nombre, valor] of crudos) {
    const hex = resolver(valor)
    if (hex) tokens.set(nombre, hex)
  }
  return tokens
}

/* --- Cálculo de contraste (WCAG 2.1) -------------------------------------- */

const aRgb = (hex) => {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

const luminancia = (hex) =>
  aRgb(hex)
    .map((c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0)

const contraste = (a, b) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/* --- Pares declarados ------------------------------------------------------
   `nivel` decide el umbral. 'texto' es AA para texto normal, 'ui' es AA para
   componentes, y 'borde' es un umbral propio, más bajo a propósito: un borde
   decorativo no tiene por qué cumplir AA, pero sí tiene que verse. */

const UMBRALES = { texto: 4.5, ui: 3.0, borde: 1.25 }

const PARES = [
  // Texto sobre las superficies del sitio
  ['--foreground', '--background', 'texto'],
  ['--muted-foreground', '--background', 'texto'],
  ['--primary', '--background', 'texto'],
  ['--card-foreground', '--card', 'texto'],
  ['--popover-foreground', '--popover', 'texto'],
  ['--foreground', '--muted', 'texto'],
  ['--muted-foreground', '--muted', 'texto'],
  ['--accent-foreground', '--accent', 'texto'],
  ['--primary-foreground', '--primary', 'texto'],

  // Semánticos: la tinta sobre el fondo y sobre su propio tinte suave
  ['--destructive', '--background', 'texto'],
  ['--destructive', '--destructive-suave', 'texto'],
  ['--destructive-foreground', '--destructive', 'texto'],
  ['--exito', '--background', 'texto'],
  ['--exito', '--exito-suave', 'texto'],
  ['--exito-foreground', '--exito', 'texto'],
  ['--aviso', '--background', 'texto'],
  ['--aviso', '--aviso-suave', 'texto'],
  ['--aviso-foreground', '--aviso', 'texto'],
  ['--info', '--background', 'texto'],
  ['--info', '--info-suave', 'texto'],
  ['--info-foreground', '--info', 'texto'],

  // El campo violeta: lo único que puede ir encima es blanco o los dos tokens
  // pensados para eso. Por eso no hay ningún par de color de marca aquí.
  ['#ffffff', '--sj-violeta', 'texto'],
  ['--violeta-sobre', '--sj-violeta', 'texto'],
  ['--violeta-activo', '--sj-violeta', 'texto'],
  ['#ffffff', '--sj-violeta-honda', 'texto'],
  ['--violeta-sobre', '--sj-violeta-honda', 'texto'],
  /* El panel desplegable de la cabecera va sobre violeta honda, y ahí el
     sub-ítem activo se pinta con --violeta-activo: la pareja existía en la
     interfaz sin estar vigilada acá. */
  ['--violeta-activo', '--sj-violeta-honda', 'texto'],
  ['--banda-lima', '--sj-violeta-honda', 'ui'],

  // Tintas de categoría sobre tarjeta blanca y sobre su tinte
  ['--cat-deportivo', '--card', 'texto'],
  ['--cat-cultural', '--card', 'texto'],
  ['--cat-artistico', '--card', 'texto'],
  ['--cat-salud', '--card', 'texto'],
  ['--cat-formativo', '--card', 'texto'],
  ['--cat-comunitario', '--card', 'texto'],
  ['--foreground', '--cat-deportivo-suave', 'texto'],
  ['--foreground', '--cat-cultural-suave', 'texto'],
  ['--foreground', '--cat-artistico-suave', 'texto'],
  ['--foreground', '--cat-salud-suave', 'texto'],
  ['--foreground', '--cat-formativo-suave', 'texto'],
  ['--foreground', '--cat-comunitario-suave', 'texto'],
  ['--muted-foreground', '--cat-deportivo-suave', 'texto'],
  ['--muted-foreground', '--cat-cultural-suave', 'texto'],
  ['--muted-foreground', '--cat-artistico-suave', 'texto'],
  ['--muted-foreground', '--cat-salud-suave', 'texto'],
  ['--muted-foreground', '--cat-formativo-suave', 'texto'],
  ['--muted-foreground', '--cat-comunitario-suave', 'texto'],

  // Componentes: relleno, anillo de foco y series de gráfico
  ['--acento', '--background', 'ui'],
  ['--ring', '--background', 'ui'],
  ['--chart-1', '--card', 'ui'],
  ['--chart-2', '--card', 'ui'],
  ['--chart-3', '--card', 'ui'],
  ['--chart-4', '--card', 'ui'],
  ['--chart-5', '--card', 'ui'],
  ['--chart-6', '--card', 'ui'],

  // Bordes: no cumplen AA por diseño, pero no pueden ser invisibles
  ['--border', '--background', 'borde'],
  ['--input', '--background', 'borde'],
  ['--border', '--card', 'borde'],
]

/* --- Ejecución ------------------------------------------------------------- */

const tokens = leerTokens(readFileSync(CSS, 'utf8'))
const resolverPar = (ref) => (ref.startsWith('#') ? ref : tokens.get(ref))

let fallos = 0
let avisos = 0
const filas = []

for (const [frenteRef, fondoRef, nivel] of PARES) {
  const frente = resolverPar(frenteRef)
  const fondo = resolverPar(fondoRef)

  if (!frente || !fondo) {
    fallos += 1
    filas.push(`  ✗ ${frenteRef} sobre ${fondoRef} — token sin resolver`)
    continue
  }

  const ratio = contraste(frente, fondo)
  const minimo = UMBRALES[nivel]
  const ok = ratio >= minimo
  if (!ok) fallos += 1

  filas.push(
    `  ${ok ? '✓' : '✗'} ${ratio.toFixed(2).padStart(5)}:1  (min ${minimo})  ` +
      `${frenteRef} sobre ${fondoRef}`,
  )
}

/* Comprobación inversa: el naranja institucional NO debe cumplir AA como texto.
   Si algún día lo cumple es que alguien "arregló" la marca, y entonces la regla
   de los dos naranjas —#E2690F superficie, #BD5200 texto— dejó de tener sentido
   y hay que revisarla en vez de arrastrarla. */
const naranja = tokens.get('--sj-naranja')
const fondo = tokens.get('--background')
if (naranja && fondo && contraste(naranja, fondo) >= 4.5) {
  avisos += 1
  filas.push(
    `  ! --sj-naranja ahora cumple AA como texto (${contraste(naranja, fondo).toFixed(2)}:1). ` +
      `Revisa si la separación acento/primary sigue haciendo falta.`,
  )
}

console.log('\nAuditoría de contraste — globals.css\n')
console.log(filas.join('\n'))
console.log(
  `\n${PARES.length} pares comprobados · ${fallos} fallo(s) · ${avisos} aviso(s)\n`,
)

process.exit(fallos > 0 ? 1 : 0)
