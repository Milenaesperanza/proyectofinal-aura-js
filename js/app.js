import * as temporizador from "./temporizador.js";

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

function conectarEventos() {
  dom.btnPlay.addEventListener("click", temporizador.alternar);
  dom.btnReiniciar.addEventListener("click", temporizador.reiniciar);

  dom.modos.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-modo]");
    if (boton === null) return;

    temporizador.cambiarModo(boton.dataset.modo);
    marcarPastillaActiva(dom.modos, boton);
  });
}

function iniciar() {
  conectarEventos();
  temporizador.dibujar();
}

iniciar();
