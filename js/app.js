import * as temporizador from "./temporizador.js";

import { dosDigitos } from "./ui.js";

import { cargarDatos, categorias, plantillas, actividades, buscarCategoria, agregarActividad } from "./agenda.js";

const lista = document.getElementById("lista-actividades");
const mensajeVacio = document.getElementById("mensaje-vacio");
const sugerencias = document.getElementById("sugerencias");
const btnNueva = document.getElementById("btn-nueva");
const modal = document.getElementById("modal-actividad");
const formulario = document.getElementById("formulario-actividad");
const campoTitulo = document.getElementById("campo-titulo");
const campoHoras = document.getElementById("campo-hora-horas");
const campoMinutos = document.getElementById("campo-hora-minutos");
const contenedorCategorias = document.getElementById("categorias");
const error = document.getElementById("formulario-error");
const btnCancelar = document.getElementById("btn-cancelar");

// Categoría elegida en el modal.
let categoriaElegida = "";

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
  lista.innerHTML = "";

  actividades.forEach((actividad) => {
    const categoria = buscarCategoria(actividad.categoriaId);
    const item = document.createElement("li");

    item.className = "tarjeta";
    item.style.setProperty("--color-categoria", categoria.color);
    item.innerHTML = `
      <div class="tarjeta__cuerpo">
        <p class="tarjeta__titulo">${actividad.emoji} ${actividad.titulo}</p>
        <p class="tarjeta__meta">
          <span>${actividad.hora}</span>
          <span>${categoria.emoji} ${categoria.nombre}</span>
        </p>
      </div>
    `;

    lista.appendChild(item);
  });

  mensajeVacio.hidden = actividades.length > 0;
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

// Marca visualmente la elegida y la guarda para el submit.
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

function abrirModal() {
  formulario.reset();
  error.hidden = true;
  elegirCategoria(categorias[0].id);
  modal.classList.add("modal--abierto");
  campoTitulo.focus();
}

function cerrarModal() {
  modal.classList.remove("modal--abierto");
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

  // Delegación: un solo listener para todas las pastillas.
  contenedorCategorias.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".pastilla");

    if (boton) elegirCategoria(boton.dataset.id);
  });

  btnNueva.addEventListener("click", abrirModal);
  btnCancelar.addEventListener("click", cerrarModal);

  // Clic en el fondo oscuro también cierra.
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

    agregarActividad({
      titulo: titulo,
      hora: `${dosDigitos(horas)}:${dosDigitos(minutos)}`,
      categoriaId: categoriaElegida,
      emoji: buscarCategoria(categoriaElegida).emoji,
    });

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
