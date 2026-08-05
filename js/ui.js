export function dosDigitos(numero) {
  return String(numero).padStart(2, "0");
}

export function formatearReloj(segundos) {
  const minutos = parseInt(segundos / 60);
  const resto = segundos % 60;

  return `${dosDigitos(minutos)}:${dosDigitos(resto)}`;
}

// El camino de vuelta: "25:00" -> 1500 segundos.
export function segundosDesdeReloj(texto) {
  const [minutos, segundos] = texto.trim().split(":").map(Number);

  return minutos * 60 + segundos;
}
