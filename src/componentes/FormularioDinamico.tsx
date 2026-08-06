'use client'

import { useId, useRef, useState } from 'react'

import { Alerta } from './Estados'
import { Boton } from './Boton'
import { cn } from '@/lib/cn'

/**
 * Formulario armado desde el panel (encuestas, inscripción a un evento
 * puntual), a diferencia de `FormularioContacto`, que es a medida.
 *
 * Renderiza los tipos de campo habilitados en el plugin de Payload
 * (`payload.config.ts`): texto, párrafo, selección, correo, casilla, número
 * y fecha. Si el equipo habilita un tipo nuevo en el panel sin agregarlo
 * aquí, ese campo específico no se pinta — el resto del formulario sigue
 * funcionando, no se cae entero por un campo desconocido.
 */

export type CampoFormulario =
  | { tipo: 'text' | 'textarea' | 'email' | 'number' | 'date'; name: string; label?: string; required?: boolean; defaultValue?: string | number }
  | { tipo: 'select'; name: string; label?: string; required?: boolean; defaultValue?: string; opciones: { label: string; value: string }[] }
  | { tipo: 'checkbox'; name: string; label?: string; required?: boolean; defaultValue?: boolean }

export type DatosFormulario = {
  id: string
  titulo: string
  campos: CampoFormulario[]
  textoBoton: string
  mensajeConfirmacion: string
}

export const FormularioDinamico = ({ form }: { form: DatosFormulario }) => {
  const id = useId()
  const [valores, setValores] = useState<Record<string, string | boolean>>({})
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'enviado' | 'fallo'>('inicial')
  const trampa = useRef<HTMLInputElement>(null)

  const cambiar = (name: string, valor: string | boolean) =>
    setValores((v) => ({ ...v, [name]: valor }))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()

    /* Mismo honeypot que el formulario de contacto: un campo invisible que
       ningún visitante real llega a completar. */
    if (trampa.current?.value) {
      setEstado('enviado')
      return
    }

    setEstado('enviando')
    try {
      const respuesta = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: form.id,
          submissionData: Object.entries(valores).map(([field, value]) => ({ field, value })),
        }),
      })
      if (!respuesta.ok) throw new Error('fallo el envío')
      setEstado('enviado')
    } catch {
      setEstado('fallo')
    }
  }

  if (estado === 'enviado') {
    return (
      <Alerta tono="exito" titulo="Enviado">
        {form.mensajeConfirmacion}
      </Alerta>
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-5">
      <h2 className="font-display text-xl font-bold">{form.titulo}</h2>

      {estado === 'fallo' ? (
        <Alerta tono="error" titulo="No pudimos enviar el formulario">
          Puede ser un problema de conexión. Inténtalo de nuevo en un momento.
        </Alerta>
      ) : null}

      {form.campos.map((campo) => (
        <CampoUno key={campo.name} campo={campo} idBase={id} onCambio={cambiar} />
      ))}

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
        <Boton type="submit" cargando={estado === 'enviando'}>
          {form.textoBoton}
        </Boton>
      </div>
    </form>
  )
}

const CampoUno = ({
  campo,
  idBase,
  onCambio,
}: {
  campo: CampoFormulario
  idBase: string
  onCambio: (name: string, valor: string | boolean) => void
}) => {
  const id = `${idBase}-${campo.name}`
  const clasesCampo = cn(
    'border-input bg-card min-h-11 w-full rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-base',
    'transition-colors duration-[var(--duracion-rapida)]',
  )

  if (campo.tipo === 'checkbox') {
    return (
      <label htmlFor={id} className="flex items-center gap-2.5 font-medium">
        <input
          id={id}
          type="checkbox"
          required={campo.required}
          defaultChecked={campo.defaultValue}
          onChange={(e) => onCambio(campo.name, e.target.checked)}
          className="h-5 w-5 shrink-0"
        />
        {campo.label}
        {campo.required ? <span className="text-destructive">*</span> : null}
      </label>
    )
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {campo.label}
        {campo.required ? (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {campo.tipo === 'textarea' ? (
        <textarea
          id={id}
          required={campo.required}
          defaultValue={campo.defaultValue}
          onChange={(e) => onCambio(campo.name, e.target.value)}
          className={cn(clasesCampo, 'min-h-32')}
        />
      ) : campo.tipo === 'select' ? (
        <select
          id={id}
          required={campo.required}
          defaultValue={campo.defaultValue ?? ''}
          onChange={(e) => onCambio(campo.name, e.target.value)}
          className={clasesCampo}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {campo.opciones.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={campo.tipo === 'date' ? 'date' : campo.tipo}
          required={campo.required}
          defaultValue={campo.defaultValue}
          onChange={(e) => onCambio(campo.name, e.target.value)}
          className={clasesCampo}
        />
      )}
    </div>
  )
}
