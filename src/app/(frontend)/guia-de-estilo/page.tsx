import type { Metadata } from 'next'

import { Bloques } from '@/bloques/Bloques'
import { AccesoDestacado } from '@/componentes/AccesoDestacado'
import { Banderola, FiloBanderola, FondoHero } from '@/componentes/Banderola'
import { Boton, BotonEnlace } from '@/componentes/Boton'
import { Buscador } from '@/componentes/Buscador'
import { CarruselDestacados } from '@/componentes/CarruselDestacados'
import { ChipCategoria, Microetiqueta } from '@/componentes/ChipCategoria'
import { CLAVES_CATEGORIA } from '@/componentes/categorias'
import { Alerta, CargandoLista, EstadoVacio } from '@/componentes/Estados'
import { FichaRecinto } from '@/componentes/FichaRecinto'
import { FormularioContacto } from '@/componentes/FormularioContacto'
import { Galeria } from '@/componentes/Galeria'
import { IconoBalon, IconoCalendario, IconoUbicacion } from '@/componentes/Iconos'
import { MigaDePan } from '@/componentes/MigaDePan'
import { URL_TALLERES } from '@/constantes/enlaces-externos'
import { VideoCard } from '@/componentes/VideoCard'
import { ListaEscalonada, Revelar, TituloAnimado } from '@/lib/movimiento'
import {
  BLOQUES_EJEMPLO,
  DESTACADOS_EJEMPLO,
  RECINTOS_EJEMPLO,
  GALERIA_EJEMPLO,
  NOTICIAS_EJEMPLO,
} from '@/datos-ejemplo'
import { TarjetaNoticia } from '@/componentes/TarjetaNoticia'
import { MuestraColor, RejillaColor } from './MuestrasColor'

export const metadata: Metadata = {
  title: 'Guía de estilo',
  description: 'El sistema de diseño del portal: tokens, tipografía y componentes.',
  robots: { index: false, follow: false },
}

/**
 * Guía viva del sistema.
 *
 * Es la puerta de aprobación: aquí se revisa el lenguaje visual antes de
 * construir las pantallas reales. Todo lo que se ve son los componentes de
 * verdad con los tokens de verdad, no capturas ni maquetas — si algo se rompe
 * en el sistema, se rompe aquí primero.
 */
export default function PaginaGuiaDeEstilo() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <FondoHero />
        <div className="shell relative py-20 md:py-28">
          <Microetiqueta className="text-violeta-sobre">Documento interno</Microetiqueta>
          <TituloAnimado
            texto="Guía de estilo del portal"
            className="font-display mt-3 max-w-3xl text-[40px] leading-[1.02] font-black text-white md:text-[64px]"
          />
          <p className="text-violeta-sobre mt-5 max-w-2xl text-lg">
            Municipal, pero vivo: masa violeta, acento naranja, aire y tipografía grande. Los
            valores de esta página se leen del sistema en vivo, no están escritos a mano.
          </p>
        </div>
        {/* Cierre inferior: aquí sí aparece la banderola, a 30°. */}
        <Banderola className="h-14" />
      </section>

      <div className="shell py-10">
        <MigaDePan migas={[{ etiqueta: 'Guía de estilo' }]} />
      </div>

      <Seccion id="concepto" titulo="El concepto" numero="01">
        <div className="grid gap-4 md:grid-cols-2">
          <Nota titulo="La banderola es composición, no adorno">
            Las tres bandas a 30° sobre el campo violeta son la firma de la institución. Ese mismo
            ángulo gobierna el corte del hero, las máscaras de las fotos y los cierres de sección.
            Un solo ángulo en todo el sitio: ni 15° ni 45°.
          </Nota>
          <Nota titulo="Portada editorial, no cuadrícula">
            La noticia principal ocupa dos tercios con la foto a sangre; las secundarias caen en
            columna. La jerarquía se ve antes de leer.
          </Nota>
          <Nota titulo="Dato en vivo donde importa">
            La ficha de cada recinto dice si está abierto ahora mismo. Es lo que convierte una
            página informativa en algo que se consulta.
          </Nota>
          <Nota titulo="Titulares grandes en Rubik">
            Hasta 64px en escritorio con −0,02em de interletrado. El cuerpo se queda en Inter a
            16px, que es el piso y no el punto de partida a negociar.
          </Nota>
        </div>
      </Seccion>

      <Seccion id="color" titulo="Color" numero="02">
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Cada muestra trae su hex y su ratio de contraste <strong>medido</strong> contra el fondo
          real <code className="font-mono text-[13px]">#FBFAF8</code>, no contra blanco puro. La
          diferencia no es trivial: por 0,19 de ratio un color deja de cumplir.
        </p>

        <SubTitulo>La regla del naranja</SubTitulo>
        <p className="text-muted-foreground mb-4 max-w-2xl">
          Es el punto que más se falla. El naranja institucional no llega a AA como texto normal, y
          la solución no es cambiar la marca sino separar dos usos.
        </p>
        <RejillaColor>
          <MuestraColor
            token="--acento"
            nota="Rellenos, bordes, iconos, barras y estados activos. Nunca texto normal."
          />
          <MuestraColor
            token="--primary"
            nota="Texto de marca y botones sólidos. Este es el que cumple."
          />
          <MuestraColor token="--acento-suave" texto="--foreground" nota="Superficie suave del acento." />
        </RejillaColor>

        <SubTitulo>Identidad institucional: la masa</SubTitulo>
        <p className="text-muted-foreground mb-4 max-w-2xl">
          Sobre el campo violeta el texto es blanco o <code>--violeta-sobre</code>, nunca un color
          de marca: encima del violeta el naranja da 3,05:1 y el morado 1,66:1.
        </p>
        <RejillaColor>
          <MuestraColor token="--sj-violeta" texto="#ffffff" nota="Campo del hero y la cabecera, medido con texto blanco." />
          <MuestraColor
            token="--sj-violeta-honda"
            texto="#ffffff"
            nota="Barra de utilidad y pie de página, medido con texto blanco."
          />
          <MuestraColor token="--violeta-sobre" sobre="--sj-violeta" nota="Texto secundario sobre violeta." />
          <MuestraColor token="--violeta-activo" sobre="--sj-violeta" nota="Ítem activo sobre violeta." />
        </RejillaColor>

        <SubTitulo>Semánticos</SubTitulo>
        <RejillaColor>
          <MuestraColor token="--foreground" nota="Texto principal." />
          <MuestraColor token="--muted-foreground" nota="Texto secundario." />
          <MuestraColor token="--destructive" nota="Error y acciones destructivas." />
          <MuestraColor token="--exito" nota="Éxito. El lima de marca da 1,9:1 y no sirve." />
          <MuestraColor token="--aviso" nota="Aviso." />
          <MuestraColor token="--info" nota="Información: el morado del logotipo, que sí cumple." />
        </RejillaColor>

        <SubTitulo>Tintas de categoría</SubTitulo>
        <p className="text-muted-foreground mb-4 max-w-2xl">
          Una tinta por categoría, medida sobre tarjeta blanca. El color nunca va solo: cada
          tarjeta escribe además el nombre y le pone su icono, porque en deuteranopía el naranja,
          el lima y el carmín colapsan al mismo marrón.
        </p>
        <RejillaColor>
          <MuestraColor token="--cat-deportivo" sobre="--card" />
          <MuestraColor token="--cat-cultural" sobre="--card" />
          <MuestraColor token="--cat-artistico" sobre="--card" />
          <MuestraColor token="--cat-salud" sobre="--card" />
          <MuestraColor token="--cat-formativo" sobre="--card" />
          <MuestraColor token="--cat-comunitario" sobre="--card" />
        </RejillaColor>
        <div className="mt-5 flex flex-wrap gap-2">
          {CLAVES_CATEGORIA.map((c) => (
            <ChipCategoria key={c} categoria={c} />
          ))}
        </div>

        <SubTitulo>Bandas de la banderola</SubTitulo>
        <p className="text-muted-foreground mb-4 max-w-2xl">
          Decorativas y nada más: entre ellas hay 1,5:1, así que no pueden codificar sección,
          categoría ni estado.
        </p>
        <RejillaColor>
          <MuestraColor token="--banda-lima" texto="--foreground" />
          <MuestraColor token="--banda-naranja" texto="#ffffff" />
          <MuestraColor token="--banda-rojo" texto="#ffffff" />
        </RejillaColor>
      </Seccion>

      <Seccion id="tipografia" titulo="Tipografía" numero="03">
        <div className="border-border bg-card grid gap-6 rounded-[var(--radius-lg)] border p-6 md:p-8">
          <Escala etiqueta="H1 portada · Rubik black · 40/64px · −0,02em">
            <p className="font-display text-[40px] leading-[1.02] font-black md:text-[64px]">
              Deporte para toda la comuna
            </p>
          </Escala>
          <Escala etiqueta="H2 sección · Rubik bold · 26/34px">
            <p className="font-display text-[26px] leading-tight font-bold md:text-[34px]">
              Últimas noticias
            </p>
          </Escala>
          <Escala etiqueta="Microetiqueta · 11px · 0,14em · versalitas">
            <Microetiqueta>5 ago 2026 · En vivo</Microetiqueta>
          </Escala>
          <Escala etiqueta="Cuerpo · Inter · 16px · interlínea 1,6 · máx. 68 caracteres">
            <p className="max-w-[68ch]">
              La Corporación administra los recintos deportivos de la comuna y organiza las
              actividades que se realizan en ellos. El cuerpo nunca baja de 16px: buena parte de
              quienes consultan este portal son personas mayores, y se conectan desde el teléfono.
            </p>
          </Escala>
          <Escala etiqueta="Cifras · tabular-nums">
            <p className="tabular text-lg">
              Aforo 3.515 · 08:00 – 21:00 · +56 2 2360 4100
              <span className="text-muted-foreground block text-sm">
                Con cifras tabulares las columnas no bailan al cambiar el número.
              </span>
            </p>
          </Escala>
        </div>
      </Seccion>

      <Seccion id="forma" titulo="Forma, movimiento y ángulo" numero="04">
        <div className="grid gap-6 md:grid-cols-3">
          <Ficha titulo="Radios">
            <ul className="grid gap-3">
              {[
                ['--radius-sm', '12px'],
                ['--radius', '14px'],
                ['--radius-lg', '18px'],
              ].map(([token, valor]) => (
                <li key={token} className="flex items-center gap-3">
                  <span
                    className="bg-acento-suave border-acento h-10 w-10 border"
                    style={{ borderRadius: `var(${token})` }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[13px]">
                    {token} · {valor}
                  </span>
                </li>
              ))}
            </ul>
          </Ficha>

          <Ficha titulo="Movimiento">
            <ul className="text-muted-foreground grid gap-1.5 text-[15px]">
              <li>
                <strong className="text-foreground">150ms</strong> hover y cambio de color
              </li>
              <li>
                <strong className="text-foreground">300ms</strong> entrada de un elemento
              </li>
              <li>
                <strong className="text-foreground">450ms</strong> entrada de una sección — tope
                del sistema
              </li>
              <li className="mt-2">
                Solo <code>transform</code> y <code>opacity</code>. Todo, incluido el estado
                inicial, vive dentro de <code>prefers-reduced-motion: no-preference</code>.
              </li>
            </ul>
          </Ficha>

          <Ficha titulo="Un solo ángulo: 30°">
            <p className="text-muted-foreground text-[15px]">
              La banderola va con gradiente de topes en píxeles, no con <code>clip-path</code>: con
              porcentajes el ángulo cambia con el ancho —30° en escritorio y casi 60° en un
              teléfono— y <code>skewX</code> arrastra el contenido de los hijos.
            </p>
          </Ficha>
        </div>

        <SubTitulo>La banderola</SubTitulo>
        <div className="grid gap-4">
          <Banderola className="grid h-40 place-items-center rounded-[var(--radius-lg)]">
            <span className="font-display text-xl font-bold text-white">Variante campo</span>
          </Banderola>
          <div>
            <FiloBanderola className="rounded-full" />
            <p className="text-muted-foreground mt-2 text-sm">
              Variante filo: cierre de sección, sin campo violeta.
            </p>
          </div>
        </div>
      </Seccion>

      <Seccion id="botones" titulo="Botones" numero="05">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Altura mínima de 44px en todos los tamaños. Pasa el cursor y tabula sobre ellos: los
          estados de hover, foco y activo son reales, no una captura.
        </p>
        <div className="grid gap-6">
          <Fila etiqueta="Variantes">
            <Boton variante="primario">Primario</Boton>
            <Boton variante="secundario">Secundario</Boton>
            <Boton variante="fantasma">Fantasma</Boton>
          </Fila>
          <Fila etiqueta="Sobre violeta" oscuro>
            <Boton variante="sobreVioleta">Sobre el campo violeta</Boton>
          </Fila>
          <Fila etiqueta="Tamaños">
            <Boton tamano="sm">Pequeño</Boton>
            <Boton tamano="md">Mediano</Boton>
            <Boton tamano="lg">Grande</Boton>
          </Fila>
          <Fila etiqueta="Estados">
            <Boton cargando>Enviar</Boton>
            <Boton disabled>Deshabilitado</Boton>
            <BotonEnlace href={URL_TALLERES} externo variante="secundario">
              Enlace externo
            </BotonEnlace>
          </Fila>
        </div>
      </Seccion>

      <Seccion id="estados" titulo="Estados y avisos" numero="06">
        <div className="grid gap-4">
          <Alerta tono="info" titulo="Información">
            Las inscripciones se realizan en la plataforma de trámites.
          </Alerta>
          <Alerta tono="exito" titulo="Mensaje enviado">
            Te responderemos al correo que dejaste.
          </Alerta>
          <Alerta tono="aviso" titulo="Cierre programado">
            La piscina estará cerrada por mantención el lunes 12.
          </Alerta>
          <Alerta tono="error" titulo="No pudimos enviar el mensaje">
            Puede ser un problema de conexión. Inténtalo de nuevo.
          </Alerta>
        </div>

        <SubTitulo>Carga</SubTitulo>
        <CargandoLista cantidad={3} />

        <SubTitulo>Vacío</SubTitulo>
        <EstadoVacio
          titulo="No hay noticias en esta categoría"
          descripcion="Prueba con otra categoría o revisa todas las noticias publicadas."
          Icono={IconoCalendario}
          accion={<BotonEnlace href="/noticias">Ver todas las noticias</BotonEnlace>}
        />
      </Seccion>

      <Seccion id="noticias" titulo="Tarjetas de noticia" numero="07">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Tres variantes. La destacada lleva el corte a 30° y ocupa dos tercios; las secundarias
          caen en columna. Todas llevan filete de categoría, nombre escrito y fecha tabular.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          <TarjetaNoticia noticia={NOTICIAS_EJEMPLO[0]!} variante="destacada" prioridad className="lg:col-span-2" />
          <div className="grid content-start gap-4">
            {NOTICIAS_EJEMPLO.slice(1, 4).map((n) => (
              <TarjetaNoticia key={n.slug} noticia={n} variante="compacta" />
            ))}
          </div>
        </div>
        <ListaEscalonada className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NOTICIAS_EJEMPLO.slice(1, 4).map((n) => (
            <TarjetaNoticia key={n.slug} noticia={n} />
          ))}
        </ListaEscalonada>
      </Seccion>

      <Seccion id="accesos" titulo="Accesos destacados" numero="08">
        <ListaEscalonada className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AccesoDestacado
            titulo="Inscríbete en talleres"
            descripcion="Escuelas deportivas y talleres de la Corporación."
            href={URL_TALLERES}
            externo
            Icono={IconoBalon}
          />
          <AccesoDestacado
            titulo="Recintos deportivos"
            descripcion="Estadio, gimnasio y piscinas de la comuna."
            href="/recintos"
            Icono={IconoUbicacion}
          />
          <AccesoDestacado
            titulo="Noticias"
            descripcion="Lo último de la Corporación."
            href="/noticias"
            Icono={IconoCalendario}
          />
        </ListaEscalonada>
      </Seccion>

      <Seccion id="carrusel" titulo="Carrusel de destacados" numero="09">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Se detiene al pasar el cursor, al enfocar con el teclado y con movimiento reducido, y
          además trae botón de pausa: la WCAG exige un control explícito y el hover no lo es —con
          el dedo no existe. Se maneja con las flechas del teclado.
        </p>
        <CarruselDestacados destacados={DESTACADOS_EJEMPLO} />
      </Seccion>

      <Seccion id="recintos" titulo="Ficha de recinto" numero="10">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          El estado en vivo se calcula en hora de Santiago y se actualiza cada 30 segundos. Según
          la hora a la que mires esta página, dirá abierto, por cerrar o cerrado.
        </p>
        <div className="grid gap-6">
          <FichaRecinto recinto={RECINTOS_EJEMPLO[0]!} variante="completa" />
          <ListaEscalonada className="grid gap-6 sm:grid-cols-2">
            {RECINTOS_EJEMPLO.slice(1).map((e) => (
              <FichaRecinto key={e.slug} recinto={e} />
            ))}
          </ListaEscalonada>
        </div>
      </Seccion>

      <Seccion id="galerias" titulo="Galería y video" numero="11">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          El visor es un <code>&lt;dialog&gt;</code> nativo: el foco queda atrapado dentro,{' '}
          <kbd>Esc</kbd> cierra y las flechas navegan. El video carga solo la miniatura hasta que
          se pulsa.
        </p>
        <Galeria imagenes={GALERIA_EJEMPLO} titulo="Actividades de la Corporación" />
        <div className="mt-6 max-w-xl">
          <VideoCard idYoutube="aqz-KE-bpKQ" titulo="Resumen de la Liga Femenina 2026" />
        </div>
      </Seccion>

      <Seccion id="formulario" titulo="Formulario y buscador" numero="12">
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Envíalo vacío para ver el resumen de errores: el foco salta al primer campo inválido y
          cada error queda enlazado con su campo. La protección anti-spam es un honeypot, no un
          CAPTCHA — un CAPTCHA es una barrera real para un adulto mayor.
        </p>
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="border-border bg-card rounded-[var(--radius-lg)] border p-6 md:p-8">
            <FormularioContacto />
          </div>
          <div className="grid content-start gap-4">
            <Ficha titulo="Buscador">
              <Buscador />
            </Ficha>
            <Ficha titulo="Sobre violeta">
              <div className="bg-violeta rounded-[var(--radius)] p-4">
                <Buscador sobreVioleta />
              </div>
            </Ficha>
          </div>
        </div>
      </Seccion>

      <Seccion id="bloques" titulo="Bloques del constructor de páginas" numero="13">
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Con estos bloques el personal de la Corporación arma una página nueva desde el panel, sin
          tocar código. El editor controla la estructura; el aspecto lo pone el sistema.
        </p>
        <div className="grid gap-12">
          <Bloques bloques={BLOQUES_EJEMPLO} />
        </div>
      </Seccion>
    </>
  )
}

/* --- Andamiaje de la guía -------------------------------------------------- */

const Seccion = ({
  id,
  titulo,
  numero,
  children,
}: {
  id: string
  titulo: string
  numero: string
  children: React.ReactNode
}) => (
  <section id={id} className="border-border border-t py-14 md:py-20">
    <div className="shell">
      <Revelar as="header" className="mb-8">
        <Microetiqueta className="text-primary">{numero}</Microetiqueta>
        <h2 className="font-display mt-2 text-[26px] leading-tight font-bold md:text-[34px]">
          {titulo}
        </h2>
      </Revelar>
      {children}
    </div>
  </section>
)

const SubTitulo = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display mt-10 mb-4 text-xl font-bold">{children}</h3>
)

const Nota = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="border-acento bg-card rounded-[var(--radius)] border border-l-6 p-5">
    <h3 className="font-display font-bold">{titulo}</h3>
    <p className="text-muted-foreground mt-1.5 text-[15px]">{children}</p>
  </div>
)

const Ficha = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="border-border bg-card rounded-[var(--radius-lg)] border p-5">
    <h3 className="font-display mb-3 font-bold">{titulo}</h3>
    {children}
  </div>
)

const Escala = ({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) => (
  <div className="border-border grid gap-2 border-b pb-5 last:border-0 last:pb-0">
    <Microetiqueta>{etiqueta}</Microetiqueta>
    {children}
  </div>
)

const Fila = ({
  etiqueta,
  oscuro = false,
  children,
}: {
  etiqueta: string
  oscuro?: boolean
  children: React.ReactNode
}) => (
  <div>
    <Microetiqueta>{etiqueta}</Microetiqueta>
    <div
      className={`mt-2 flex flex-wrap items-center gap-3 rounded-[var(--radius)] p-4 ${
        oscuro ? 'bg-violeta' : 'bg-muted'
      }`}
    >
      {children}
    </div>
  </div>
)
