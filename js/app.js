import * as temporizador from "./temporizador.js";

import { dosDigitos } from "./ui.js";

import {
  cargarDatos,
  categorias,
  plantillas,
  actividades,
  listarPor,
  buscarCategoria,
  agregarActividad,
  buscarActividad,
  editarActividad,
  eliminarActividad,
  alternarCompletada,
} from "./agenda.js";

const lista = document.getElementById("lista-actividades");
const mensajeVacio = document.getElementById("mensaje-vacio");
const sugerencias = document.getElementById("sugerencias");
const btnNueva = document.getElementById("btn-nueva");
const modal = document.getElementById("modal-actividad");
const formulario = document.getElementById("formulario-actividad");
const formularioTitulo = document.getElementById("formulario-titulo");
const campoTitulo = document.getElementById("campo-titulo");
const campoHoras = document.getElementById("campo-hora-horas");
const campoMinutos = document.getElementById("campo-hora-minutos");
const contenedorCategorias = document.getElementById("categorias");
const contenedorFiltros = document.getElementById("filtros");
const error = document.getElementById("formulario-error");
const btnCancelar = document.getElementById("btn-cancelar");

// Categoría elegida en el modal.
let categoriaElegida = "";

// Qué actividad se está editando.
let actividadEditando = null;

// Arranca en "todas" para que coincida con la pastilla activa del HTML.
let filtroActivo = "todas";

const $ = (selector) => document.querySelector(selector);

const dom = {
  btnPlay: $("#btn-play"),
  btnReiniciar: $("#btn-reiniciar"),
  modos: $("#modos"),
};

function marcarPastillaActiva(contenedor, elegida) {
  contenedor.querySelectorAll(".pastilla").forEach((pastilla) => {
    pastilla.classList.remove("pastilla--activa");
  });

  elegida.classList.add("pastilla--activa");
}

// ---------- Agenda ----------

function pintarAgenda() {
  const visibles = listarPor(filtroActivo);

  lista.innerHTML = "";

  visibles.forEach((actividad) => {
    const categoria = buscarCategoria(actividad.categoriaId);
    const item = document.createElement("li");

    item.className = "tarjeta";
    item.dataset.id = actividad.id;
    item.style.setProperty("--color-categoria", categoria.color);

    if (actividad.completada) item.classList.add("tarjeta--completada");

    let textoCheck = "Listo";
    if (actividad.completada) textoCheck = "Deshacer";

    item.innerHTML = `
      <div class="tarjeta__cuerpo">
        <p class="tarjeta__titulo">
          <span aria-hidden="true">${actividad.emoji}</span>
          <span class="tarjeta__nombre"></span>
        </p>
        <p class="tarjeta__meta">
          <span>${actividad.hora}</span>
          <span>${categoria.emoji} ${categoria.nombre}</span>
        </p>
      </div>

      <div class="tarjeta__acciones">
        <button class="accion" type="button" data-accion="editar">Editar</button>
        <button class="accion accion--borrar" type="button" data-accion="eliminar">Borrar</button>
        <button class="accion accion--check" type="button" data-accion="completar">${textoCheck}</button>
      </div>
    `;

    // El título lo escribe el usuario con textContent.
    item.querySelector(".tarjeta__nombre").textContent = actividad.titulo;

    lista.appendChild(item);
  });

  mensajeVacio.hidden = visibles.length > 0;
}

function pintarCategorias() {
  contenedorCategorias.innerHTML = "";

  categorias.forEach((categoria) => {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = "pastilla pastilla--categoria";
    boton.dataset.id = categoria.id;
    boton.style.setProperty("--color-categoria", categoria.color);
    boton.textContent = `${categoria.emoji} ${categoria.nombre}`;

    contenedorCategorias.appendChild(boton);
  });
}

// Marca la elegida y la guarda para el submit.
function elegirCategoria(id) {
  categoriaElegida = id;

  contenedorCategorias.querySelectorAll(".pastilla").forEach((boton) => {
    boton.classList.toggle("pastilla--activa", boton.dataset.id === id);
  });
}

function pintarSugerencias() {
  sugerencias.innerHTML = "";

  plantillas.forEach((plantilla) => {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = "pastilla pastilla--actividad";
    boton.dataset.id = plantilla.id;
    boton.textContent = `${plantilla.emoji} ${plantilla.titulo}`;

    sugerencias.appendChild(boton);
  });
}

// ---------- Modal ----------

function abrirModal(actividad = null) {
  formulario.reset();
  error.hidden = true;

  if (actividad) {
    actividadEditando = actividad.id;
    formularioTitulo.textContent = "Editar actividad";
    campoTitulo.value = actividad.titulo;

    const [horas, minutos] = actividad.hora.split(":");
    campoHoras.value = horas;
    campoMinutos.value = minutos;

    elegirCategoria(actividad.categoriaId);
  } else {
    actividadEditando = null;
    formularioTitulo.textContent = "Nueva actividad";
    elegirCategoria(categorias[0].id);
  }

  modal.classList.add("modal--abierto");
  campoTitulo.focus();
}

function cerrarModal() {
  modal.classList.remove("modal--abierto");
  actividadEditando = null;
}

// ---------- Acciones de la tarjeta ----------

function completar(actividad) {
  alternarCompletada(actividad.id);

  pintarAgenda();
}

function eliminar(actividad) {
  const confirmado = confirm(`¿Querés borrar "${actividad.titulo}"?`);

  if (confirmado === false) return;

  eliminarActividad(actividad.id);

  pintarAgenda();
}

function manejarClicEnLista(evento) {
  const disparador = evento.target.closest("[data-accion]");
  const tarjeta = evento.target.closest(".tarjeta");

  if (disparador === null || tarjeta === null) return;

  const actividad = buscarActividad(tarjeta.dataset.id);

  if (actividad === undefined) return;

  switch (disparador.dataset.accion) {
    case "completar":
      completar(actividad);
      break;
    case "editar":
      abrirModal(actividad);
      break;
    case "eliminar":
      eliminar(actividad);
      break;
  }
}

// ---------- Eventos ----------

function conectarEventos() {
  dom.btnPlay.addEventListener("click", temporizador.alternar);
  dom.btnReiniciar.addEventListener("click", temporizador.reiniciar);

  dom.modos.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-modo]");
    if (boton === null) return;

    temporizador.cambiarModo(boton.dataset.modo);
    marcarPastillaActiva(dom.modos, boton);
  });

  contenedorFiltros.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-filtro]");
    if (boton === null) return;

    filtroActivo = boton.dataset.filtro;

    marcarPastillaActiva(contenedorFiltros, boton);
    pintarAgenda();
  });

  // Un solo listener para todas las actividades sugeridas.
  contenedorCategorias.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".pastilla");

    if (boton) elegirCategoria(boton.dataset.id);
  });

  lista.addEventListener("click", manejarClicEnLista);

  btnNueva.addEventListener("click", () => abrirModal());
  btnCancelar.addEventListener("click", cerrarModal);

  // Clic en el fondo oscuro también cierra el modal.
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) cerrarModal();
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const horas = parseInt(campoHoras.value);
    const minutos = parseInt(campoMinutos.value);

    if (titulo === "") {
      error.textContent = "Escribí qué querés hacer.";
      error.hidden = false;
      return;
    }

    if (horas < 5 || horas > 23 || minutos < 0 || minutos > 59) {
      error.textContent = "Revisá la hora: tiene que estar entre las 5:00 y las 23:59.";
      error.hidden = false;
      return;
    }

    const datos = {
      titulo: titulo,
      hora: `${dosDigitos(horas)}:${dosDigitos(minutos)}`,
      categoriaId: categoriaElegida,
      emoji: buscarCategoria(categoriaElegida).emoji,
    };

    if (actividadEditando) {
      editarActividad(actividadEditando, datos);
    } else {
      agregarActividad(datos);
    }

    pintarAgenda();
    cerrarModal();
  });

  sugerencias.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".pastilla");

    if (!boton) return;

    const plantilla = plantillas.find((item) => item.id === boton.dataset.id);

    agregarActividad({
      titulo: plantilla.titulo,
      hora: plantilla.horaSugerida,
      categoriaId: plantilla.categoriaId,
      emoji: plantilla.emoji,
    });

    pintarAgenda();
  });
}

async function iniciar() {
  conectarEventos();
  temporizador.dibujar();

  await cargarDatos();

  pintarCategorias();
  pintarSugerencias();
  pintarAgenda();
}

iniciar();
