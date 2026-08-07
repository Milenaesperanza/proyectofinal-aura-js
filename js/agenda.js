// Datos y estado de la agenda.

async function traerJSON(archivo) {
  const respuesta = await fetch(`data/${archivo}.json`);

  if (!respuesta.ok) throw new Error(`No se pudo leer ${archivo}.json`);

  return await respuesta.json();
}

export let categorias = [];
export let plantillas = [];
export const actividades = [];

// Se llama una sola vez al arrancar la app.
export async function cargarDatos() {
  categorias = await traerJSON("categorias");
  plantillas = await traerJSON("plantillas");
}

// Devuelve las actividades que entran en el filtro elegido.
export function listarPor(filtro) {
  if (filtro === "pendientes") {
    return actividades.filter((actividad) => actividad.completada === false);
  }

  if (filtro === "completadas") {
    return actividades.filter((actividad) => actividad.completada === true);
  }

  return actividades;
}

export function buscarCategoria(id) {
  return categorias.find((categoria) => categoria.id === id);
}

let contadorActividades = 0;

function nuevoId() {
  contadorActividades++;

  return `act-${Date.now()}-${contadorActividades}`;
}

// Suma una actividad al estado y la devuelve ya armada.
export function agregarActividad({ titulo, hora, categoriaId, emoji }) {
  const actividad = {
    id: nuevoId(),
    titulo: titulo.trim(),
    hora: hora,
    categoriaId: categoriaId,
    emoji: emoji,
    completada: false,
  };

  actividades.push(actividad);
  actividades.sort((a, b) => a.hora.localeCompare(b.hora));

  return actividad;
}

// Busca una actividad por su id; find devuelve undefined si no la encuentra.
export function buscarActividad(id) {
  return actividades.find((actividad) => actividad.id === id);
}

// Modifica una actividad existente y la reordena si cambió de hora.
export function editarActividad(id, cambios) {
  const actividad = buscarActividad(id);

  if (actividad === undefined) return undefined;

  actividad.titulo = cambios.titulo.trim();
  actividad.hora = cambios.hora;
  actividad.categoriaId = cambios.categoriaId;
  actividad.emoji = cambios.emoji;

  actividades.sort((a, b) => a.hora.localeCompare(b.hora));

  return actividad;
}

// Elimina una actividad de la lista.
export function eliminarActividad(id) {
  const posicion = actividades.findIndex((actividad) => actividad.id === id);

  if (posicion === -1) return;

  actividades.splice(posicion, 1);
}

// Marca o desmarca una actividad como completada, y devuelve cómo quedó.
export function alternarCompletada(id) {
  const actividad = buscarActividad(id);

  if (actividad.completada === true) {
    actividad.completada = false;
  } else {
    actividad.completada = true;
  }

  return actividad.completada;
}
