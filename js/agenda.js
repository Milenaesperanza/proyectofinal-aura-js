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

// La usan la tarjeta y el modal para saber color, emoji y nombre.
export function buscarCategoria(id) {
  return categorias.find((categoria) => categoria.id === id);
}

// Suma una actividad al estado y la devuelve ya armada.
export function agregarActividad({ titulo, hora, categoriaId, emoji }) {
  const actividad = {
    id: Date.now(),
    titulo: titulo.trim(),
    hora: hora,
    categoriaId: categoriaId,
    emoji: emoji,
  };

  actividades.push(actividad);
  actividades.sort((a, b) => a.hora.localeCompare(b.hora));

  return actividad;
}
