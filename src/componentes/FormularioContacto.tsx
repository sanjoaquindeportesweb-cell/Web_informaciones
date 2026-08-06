'use client'

import { useId, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import { Alerta } from './Estados'
import { Boton } from './Boton'

/**
 * Formulario de contacto.
 *
 * Lo que hace que este formulario sea usable y no solo bonito:
 *
 * - **Etiqueta visible siempre.** Nunca solo `placeholder`: en cuanto se
 *   escribe, el placeholder desaparece y ya no se sabe qué pedía el campo.
 * - **El error va junto al campo** y enlazado con `aria-describedby`, no solo
 *   arriba y no solo en rojo.
 * - **Resumen de errores enfocable** al enviar, y el foco salta al primer
 *   campo inválido. Con seis campos y el error abajo, quien usa lector de
 *   pantalla no se entera de que algo falló.
 * - **Validación al salir del campo**, no en cada tecla: marcar en rojo
 *   mientras alguien todavía escribe su correo es hostil.
 * - **Anti-spam por honeypot**, no CAPTCHA. Un CAPTCHA es una barrera real
 *   para un adulto mayor, y este es un servicio público.
 */

type Campos = {
  nombre: string
  correo: string
  telefono: string
  asunto: string
  mensaje: string
}

type Errores = Partial<Record<keyof Campos, string>>

const VACIO: Campos = { nombre: '', correo: '', telefono: '', asunto: '', mensaje: '' }

const validar = (c: Campos): Errores => {
  const e: Errores = {}
  if (c.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo.trim()))
    e.correo = 'Revisa el correo: parece que falta el @ o el punto.'
  if (c.telefono.trim() && !/^[\d\s+()-]{7,}$/.test(c.telefono.trim()))
    e.telefono = 'El teléfono solo puede tener números, espacios y los signos + ( ) -'
  if (c.asunto.trim().length < 3) e.asunto = 'Cuéntanos brevemente de qué se trata.'
  if (c.mensaje.trim().length < 10) e.mensaje = 'El mensaje es muy corto para poder ayudarte.'
  return e
}

export const FormularioContacto = ({
  onEnviar,
}: {
  onEnviar?: (datos: Campos) => Promise<void>
}) => {
  const id = useId()
  const [campos, setCampos] = useState<Campos>(VACIO)
  const [errores, setErrores] = useState<Errores>({})
  const [tocados, setTocados] = useState<Partial<Record<keyof Campos, boolean>>>({})
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'enviado' | 'fallo'>('inicial')
  const resumen = useRef<HTMLDivElement>(null)
  const formulario = useRef<HTMLFormElement>(null)
  const trampa = useRef<HTMLInputElement>(null)

  const cambiar = (campo: keyof Campos) => (valor: string) => {
    setCampos((c) => ({ ...c, [campo]: valor }))
    /* Si el campo ya estaba marcado en rojo, se revalida al escribir para que
       el error desaparezca en cuanto se corrige. */
    if (tocados[campo]) setErrores(validar({ ...campos, [campo]: valor }))
  }

  const alSalir = (campo: keyof Campos) => () => {
    setTocados((t) => ({ ...t, [campo]: true }))
    setErrores(validar(campos))
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()

    /* Honeypot: es un campo que ninguna persona ve ni puede enfocar. Si viene
       lleno, lo rellenó un robot. Se responde éxito para no darle pistas. */
    if (trampa.current?.value) {
      setEstado('enviado')
      return
    }

    const nuevos = validar(campos)
    setErrores(nuevos)
    setTocados({ nombre: true, correo: true, telefono: true, asunto: true, mensaje: true })

    if (Object.keys(nuevos).length > 0) {
      resumen.current?.focus()
      const primero = Object.keys(nuevos)[0]
      formulario.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus()
      return
    }

    setEstado('enviando')
    try {
      await onEnviar?.(campos)
      setEstado('enviado')
      setCampos(VACIO)
      setTocados({})
    } catch {
      setEstado('fallo')
    }
  }

  const listaErrores = Object.entries(errores) as [keyof Campos, string][]

  if (estado === 'enviado') {
    return (
      <Alerta tono="exito" titulo="Mensaje enviado">
        Gracias por escribirnos. Te responderemos al correo que dejaste.
      </Alerta>
    )
  }

  return (
    <form ref={formulario} onSubmit={enviar} noValidate className="grid gap-5">
      {/* Resumen de errores: enfocable, para que el foco pueda aterrizar aquí. */}
      <div ref={resumen} tabIndex={-1} className="focus:outline-none">
        {listaErrores.length > 0 ? (
          <Alerta tono="error" titulo={`Revisa ${listaErrores.length} campo(s)`}>
            <ul className="mt-1 list-disc pl-5">
              {listaErrores.map(([campo, mensaje]) => (
                <li key={campo}>
                  <a href={`#${id}-${campo}`} className="underline underline-offset-2">
                    {mensaje}
                  </a>
                </li>
              ))}
            </ul>
          </Alerta>
        ) : null}
      </div>

      {estado === 'fallo' ? (
        <Alerta tono="error" titulo="No pudimos enviar el mensaje">
          Puede ser un problema de conexión. Inténtalo de nuevo en un momento.
        </Alerta>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id={`${id}-nombre`}
          nombre="nombre"
          etiqueta="Nombre y apellido"
          valor={campos.nombre}
          error={errores.nombre}
          requerido
          autoComplete="name"
          onCambio={cambiar('nombre')}
          onSalir={alSalir('nombre')}
        />
        <Campo
          id={`${id}-correo`}
          nombre="correo"
          etiqueta="Correo electrónico"
          tipo="email"
          valor={campos.correo}
          error={errores.correo}
          requerido
          autoComplete="email"
          ayuda="Te responderemos aquí."
          onCambio={cambiar('correo')}
          onSalir={alSalir('correo')}
        />
        <Campo
          id={`${id}-telefono`}
          nombre="telefono"
          etiqueta="Teléfono"
          tipo="tel"
          valor={campos.telefono}
          error={errores.telefono}
          autoComplete="tel"
          ayuda="Opcional."
          onCambio={cambiar('telefono')}
          onSalir={alSalir('telefono')}
        />
        <Campo
          id={`${id}-asunto`}
          nombre="asunto"
          etiqueta="Asunto"
          valor={campos.asunto}
          error={errores.asunto}
          requerido
          onCambio={cambiar('asunto')}
          onSalir={alSalir('asunto')}
        />
      </div>

      <Campo
        id={`${id}-mensaje`}
        nombre="mensaje"
        etiqueta="Mensaje"
        valor={campos.mensaje}
        error={errores.mensaje}
        requerido
        area
        onCambio={cambiar('mensaje')}
        onSalir={alSalir('mensaje')}
      />

      {/* El honeypot va fuera de la vista y fuera del tabulador, y se le dice
          al navegador que no lo autocomplete. */}
      <input
        ref={trampa}
        type="text"
        name="sitio-web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <div>
        <Boton type="submit" tamano="lg" cargando={estado === 'enviando'}>
          Enviar mensaje
        </Boton>
      </div>
    </form>
  )
}

const Campo = ({
  id,
  nombre,
  etiqueta,
  valor,
  error,
  ayuda,
  tipo = 'text',
  requerido = false,
  area = false,
  autoComplete,
  onCambio,
  onSalir,
}: {
  id: string
  nombre: string
  etiqueta: string
  valor: string
  error?: string
  ayuda?: string
  tipo?: string
  requerido?: boolean
  area?: boolean
  autoComplete?: string
  onCambio: (v: string) => void
  onSalir: () => void
}) => {
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`
  const descrito = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ')

  const clases = cn(
    'w-full rounded-[var(--radius-sm)] border bg-card px-3.5 py-2.5 text-base',
    'transition-colors duration-[var(--duracion-rapida)]',
    /* 44px de alto mínimo, y 16px de fuente: por debajo de 16 el iPhone hace
       zoom al enfocar y descoloca la página entera. */
    area ? 'min-h-36' : 'min-h-11',
    error ? 'border-destructive' : 'border-input',
  )

  return (
    <div className={area ? '' : 'min-w-0'}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {etiqueta}
        {requerido ? (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="text-muted-foreground ml-1 text-sm font-normal">(opcional)</span>
        )}
      </label>

      {ayuda ? (
        <p id={idAyuda} className="text-muted-foreground mb-1.5 text-sm">
          {ayuda}
        </p>
      ) : null}

      {area ? (
        <textarea
          id={id}
          name={nombre}
          value={valor}
          required={requerido}
          aria-invalid={error ? true : undefined}
          aria-describedby={descrito || undefined}
          onChange={(e) => onCambio(e.target.value)}
          onBlur={onSalir}
          className={clases}
        />
      ) : (
        <input
          id={id}
          name={nombre}
          type={tipo}
          value={valor}
          required={requerido}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={descrito || undefined}
          onChange={(e) => onCambio(e.target.value)}
          onBlur={onSalir}
          className={clases}
        />
      )}

      {error ? (
        <p id={idError} className="text-destructive mt-1.5 text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}
