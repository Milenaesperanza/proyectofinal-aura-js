import { formatearReloj, segundosDesdeReloj } from "./ui.js";

// ---------- Elementos del panel ----------

const dom = {
  tiempo: document.querySelector("#reloj-tiempo"),
  btnPlay: document.querySelector("#btn-play"),
  anillo: document.querySelector("#anillo-avance"),
};

// Pomodoro de 25:00 y Cronometro en 00:00
const totalPomodoro = segundosDesdeReloj(dom.tiempo.textContent);
const vueltaAnillo = 100;

// ---------- Estado inicial ----------

let modo = "pomodoro";
let transcurridos = 0;
let restantes = totalPomodoro;
let corriendo = false;
let intervalo = null;

// ---------- Animación del anillo para pintura ----------

export function dibujar() {
  let mostrado = transcurridos;
  let avance = (transcurridos % 60) / 60;

  if (modo === "pomodoro") {
    mostrado = restantes;
    avance = (totalPomodoro - restantes) / totalPomodoro;
  }

  dom.tiempo.textContent = formatearReloj(mostrado);
  dom.anillo.style.strokeDashoffset = vueltaAnillo * (1 - avance);

  if (corriendo) {
    dom.btnPlay.textContent = "Pausar";
  } else {
    dom.btnPlay.textContent = "Iniciar";
  }
}

// ---------- El conteo ----------

// Tic visual.
function tic() {
  if (modo === "pomodoro") {
    restantes -= 1;

    // Stop del pomodoro.
    if (restantes <= 0) {
      restantes = 0;
      pausar();
      return;
    }
  } else {
    transcurridos += 1;
  }

  dibujar();
}

// ---------- Controles ----------

function iniciar() {
  if (corriendo) return;

  corriendo = true;
  intervalo = setInterval(tic, 1000);

  dibujar();
}

function pausar() {
  corriendo = false;
  clearInterval(intervalo);
  intervalo = null;

  dibujar();
}

export function alternar() {
  if (corriendo) {
    pausar();
  } else {
    iniciar();
  }
}

export function reiniciar() {
  pausar();

  transcurridos = 0;
  restantes = totalPomodoro;

  dibujar();
}

export function cambiarModo(nuevo) {
  if (nuevo === modo) return;

  pausar();

  modo = nuevo;
  transcurridos = 0;
  restantes = totalPomodoro;

  dibujar();
}