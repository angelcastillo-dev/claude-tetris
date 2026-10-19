'use strict';

// Menú de pausa: se carga antes de game.js y usa su estado global en tiempo de ejecución.
const START_LEVEL_KEY = 'tetris.startLevel';
const MAX_START_LEVEL = 10;

const pauseMenu = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const controlsBtn = document.getElementById('controls-btn');
const pauseControls = document.getElementById('pause-controls');
const startLevelSelect = document.getElementById('start-level');

function loadStartLevel() {
  try {
    const n = parseInt(localStorage.getItem(START_LEVEL_KEY), 10);
    if (n >= 1 && n <= MAX_START_LEVEL) return n;
  } catch (e) { /* localStorage no disponible */ }
  return 1;
}

function saveStartLevel(n) {
  try { localStorage.setItem(START_LEVEL_KEY, String(n)); } catch (e) { /* ignorar */ }
}

let startLevel = loadStartLevel();
// Nivel base de la partida en curso (fijado en init); el selector solo afecta a la siguiente
let baseLevel = startLevel;

for (let i = 1; i <= MAX_START_LEVEL; i++) {
  startLevelSelect.add(new Option(String(i), String(i)));
}
startLevelSelect.value = String(startLevel);

function isPauseMenuOpen() {
  return !pauseMenu.classList.contains('hidden');
}

function openPauseMenu() {
  pauseMenu.classList.remove('hidden');
  resumeBtn.focus();
}

function closePauseMenu() {
  pauseMenu.classList.add('hidden');
  pauseControls.classList.add('hidden');
  controlsBtn.setAttribute('aria-expanded', 'false');
  if (document.activeElement && pauseMenu.contains(document.activeElement)) {
    document.activeElement.blur();
  }
}

// Devuelve true si la tecla ya fue gestionada y el juego debe ignorarla.
function handlePauseKey(e) {
  const onSelect = e.target === startLevelSelect;
  if (e.code === 'KeyP' || e.code === 'Escape') {
    // Esc sobre el select solo cierra su desplegable
    if (onSelect && e.code === 'Escape') return true;
    if (gameOver) return true;
    e.preventDefault();
    if (!e.repeat) togglePause();
    return true;
  }
  if (!isPauseMenuOpen()) return false;
  // Space y flechas: ni activan el botón con foco ni hacen scroll (el select conserva su uso)
  if (!onSelect && (e.code === 'Space' || e.code.startsWith('Arrow'))) e.preventDefault();
  return true;
}

// Evita que Space suelte un clic sobre el botón enfocado al soltar la tecla
document.addEventListener('keyup', e => {
  if (e.code === 'Space' && isPauseMenuOpen()) e.preventDefault();
});

// Envoltorios: togglePause/init aún no existen al cargar este script
resumeBtn.addEventListener('click', () => togglePause());
pauseRestartBtn.addEventListener('click', () => init());
controlsBtn.addEventListener('click', () => {
  const hidden = pauseControls.classList.toggle('hidden');
  controlsBtn.setAttribute('aria-expanded', String(!hidden));
});
startLevelSelect.addEventListener('change', () => {
  startLevel = parseInt(startLevelSelect.value, 10);
  saveStartLevel(startLevel);
});
