const DEFAULT_API_URL = 'https://backend-react-fcsl.onrender.com/api-backend'
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

async function leerRespuestaJson(respuesta) {
  try {
    return await respuesta.json()
  } catch {
    return null
  }
}

// GET /users → devuelve la lista de usuarios registrados
export async function obtenerUsuarios() {
  try {
    const respuesta = await fetch(`${API_URL}/users`)
    const datos = await leerRespuestaJson(respuesta)

    if (!respuesta.ok) {
      throw new Error(datos?.error || 'No se pudieron obtener los usuarios')
    }

    return Array.isArray(datos?.users) ? datos.users : []
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('No se pudieron obtener los usuarios')
  }
}

// POST /auth/register → crea un usuario y devuelve { user, token }
export async function registrarUsuario(usuario) {
  try {
    const respuesta = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    })
    const datos = await leerRespuestaJson(respuesta)

    if (!respuesta.ok) {
      throw new Error(datos?.error || 'No se pudo registrar el usuario')
    }

    return datos
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('No se pudo registrar el usuario')
  }
}

// GET /posts → devuelve todas las publicaciones
export async function obtenerPublicaciones() {
  let respuesta

  try {
    respuesta = await fetch(`${API_URL}/posts`)
  } catch {
    throw new Error('No se pudieron cargar las publicaciones. Revisa tu conexión.')
  }

  const datos = await leerRespuestaJson(respuesta)

  if (!respuesta.ok) {
    throw new Error(datos?.error || 'No se pudieron cargar las publicaciones')
  }

  if (!Array.isArray(datos?.posts)) {
    throw new Error('La respuesta del servidor no contiene una lista de publicaciones válida')
  }

  return datos.posts
}

// POST /posts → crea una publicación; requiere el token guardado al registrarse
export async function crearPublicacion(publicacion) {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Debes registrarte o iniciar sesión antes de publicar')
  }

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(publicacion),
    })
  } catch {
    throw new Error('No se pudo crear la publicación. Revisa tu conexión.')
  }

  const datos = await leerRespuestaJson(respuesta)

  if (!respuesta.ok) {
    throw new Error(datos?.error || 'No se pudo crear la publicación')
  }

  if (!datos?.post) {
    throw new Error('El servidor no devolvió la publicación creada')
  }

  return datos.post
}

// POST /posts/:postId/reactions → agrega una reacción pública
export async function reaccionarPublicacion(postId, type) {
  const body = { type }
  const usuarioGuardado = localStorage.getItem('user')

  if (usuarioGuardado) {
    let usuario
    try {
      usuario = JSON.parse(usuarioGuardado)
    } catch {
      throw new Error('La sesión guardada no es válida. Vuelve a registrarte.')
    }

    if (usuario?.id) {
      body.userId = usuario.id
    }
  }

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}/posts/${postId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('No se pudo enviar la reacción. Revisa tu conexión.')
  }

  const datos = await leerRespuestaJson(respuesta)

  if (!respuesta.ok) {
    throw new Error(datos?.error || 'No se pudo enviar la reacción')
  }

  if (!datos?.counts) {
    throw new Error('El servidor no devolvió los contadores actualizados')
  }

  return datos
}
