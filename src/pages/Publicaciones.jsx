import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  crearPublicacion,
  obtenerPublicaciones,
  reaccionarPublicacion,
} from '../services/usuario'

const REACCIONES = [
  { tipo: 'like', emoji: '👍', nombre: 'Me gusta' },
  { tipo: 'love', emoji: '❤️', nombre: 'Me encanta' },
  { tipo: 'haha', emoji: '😂', nombre: 'Me divierte' },
  { tipo: 'wow', emoji: '😮', nombre: 'Me sorprende' },
  { tipo: 'sad', emoji: '😢', nombre: 'Me entristece' },
  { tipo: 'angry', emoji: '😡', nombre: 'Me enoja' },
]

const inputClass =
  'w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20'

function fechaPublicacion(createdAt) {
  if (!createdAt || Number.isNaN(new Date(createdAt).getTime())) {
    return 'Fecha desconocida'
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(createdAt))
}

function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [reaccionandoId, setReaccionandoId] = useState('')

  const cargarPublicaciones = useCallback(async () => {
    setError('')
    setCargando(true)

    try {
      setPublicaciones(await obtenerPublicaciones())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarPublicaciones()
  }, [cargarPublicaciones])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setPublicando(true)

    try {
      const nuevaPublicacion = await crearPublicacion({
        title: titulo.trim(),
        content: contenido.trim(),
      })
      setPublicaciones((actuales) => [
        { reactions: {}, commentsCount: 0, ...nuevaPublicacion },
        ...actuales,
      ])
      setTitulo('')
      setContenido('')
    } catch (e) {
      setError(e.message)
    } finally {
      setPublicando(false)
    }
  }

  async function handleReaccion(publicacion, tipo) {
    setError('')
    setReaccionandoId(publicacion.id)

    try {
      const datos = await reaccionarPublicacion(publicacion.id, tipo)
      setPublicaciones((actuales) =>
        actuales.map((item) =>
          item.id === publicacion.id
            ? { ...item, reactions: datos.counts }
            : item,
        ),
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setReaccionandoId('')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Publicaciones
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Comparte ideas y conoce lo que publica tu clase.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-neutral-900">
          Crear una publicación
        </h2>
        <div>
          <label htmlFor="post-title" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Título
          </label>
          <input
            id="post-title"
            className={inputClass}
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Escribe el título"
            required
            maxLength={120}
          />
        </div>
        <div>
          <label htmlFor="post-content" className="mb-1.5 block text-sm font-medium text-neutral-700">
            Contenido
          </label>
          <textarea
            id="post-content"
            className={`${inputClass} min-h-32 resize-y`}
            value={contenido}
            onChange={(event) => setContenido(event.target.value)}
            placeholder="¿Qué quieres compartir con la clase?"
            required
            maxLength={5000}
          />
        </div>
        <button
          type="submit"
          disabled={publicando}
          className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publicando ? 'Publicando…' : 'Publicar'}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          {error.includes('registrarte o iniciar sesión') && (
            <Link to="/registrarme" className="mt-2 inline-block font-semibold underline">
              Ir a registrarme
            </Link>
          )}
        </div>
      )}

      <section aria-label="Listado de publicaciones" className="space-y-5">
        {cargando && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            Cargando publicaciones…
          </p>
        )}

        {!cargando && !error && publicaciones.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
            Aún no hay publicaciones. ¡Puedes crear la primera!
          </p>
        )}

        {!cargando &&
          publicaciones.map((publicacion) => (
            <article
              key={publicacion.id}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {publicacion.title}
                </h2>
                <time
                  dateTime={publicacion.createdAt}
                  className="shrink-0 text-xs text-neutral-400"
                >
                  {fechaPublicacion(publicacion.createdAt)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {publicacion.content}
              </p>
              <p className="mt-4 text-sm font-medium text-violet-700">
                Por {publicacion.author?.name || 'Autor desconocido'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                {REACCIONES.map(({ tipo, emoji, nombre }) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleReaccion(publicacion, tipo)}
                    disabled={reaccionandoId === publicacion.id}
                    aria-label={`${nombre}, ${publicacion.reactions?.[tipo] || 0} reacciones`}
                    title={nombre}
                    className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    <span aria-hidden="true">{emoji}</span>{' '}
                    {publicacion.reactions?.[tipo] || 0}
                  </button>
                ))}
                <span className="ml-auto self-center text-xs text-neutral-500">
                  {publicacion.commentsCount || 0}{' '}
                  {publicacion.commentsCount === 1 ? 'comentario' : 'comentarios'}
                </span>
              </div>
            </article>
          ))}
      </section>
    </div>
  )
}

export default Publicaciones
