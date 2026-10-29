// Patrones de los ojos LED (10 × 6): los usan los ojos 3D (eyes.js) y los 2D del 404 (LedEyes).

export const COLS = 10;
export const ROWS = 6;
// Encendidos: degradado de azul (fila de arriba) a violeta (fila de abajo).
export const ON = ['#6f9cff', '#6a8dff', '#707dff', '#7f70ff', '#8f66ff', '#a061ff'];
export const OFF = 'rgb(4, 5, 12)'; // LED apagado: apenas visible

// '#' = encendido. Filas de arriba a abajo, tal como se ven desde delante.
export const PATTERNS = {
  normal: ['..######..', '.########.', '##########', '##########', '.########.', '..######..'],
  happy: ['...####...', '..######..', '.###..###.', '##......##', '#........#', '..........'],
  focus: ['..........', '..........', '.########.', '##########', '..........', '..........'],
  surprised: ['..######..', '.##....##.', '##......##', '##......##', '.##....##.', '..######..'],
  love: ['.###..###.', '##########', '##########', '.########.', '..######..', '....##....'],
  bored: ['..........', '..........', '..........', '##########', '.########.', '..........'],
  off: ['..........', '..........', '..........', '..........', '..........', '..........'],
};
