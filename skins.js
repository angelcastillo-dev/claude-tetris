'use strict';

const SKIN_KEY = 'tetris.skin';

// Rectángulo redondeado con arcTo (sin depender de roundRect)
function roundedPath(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

const SKINS = {
  retro: {
    name: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d'],
    boardBg: '#1a1a25',
    gridColor: '#22222e',
    pageBg: '#0f0f17',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // highlight
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
  },

  neon: {
    name: 'Neon',
    colors: [null, '#00f0ff', '#fff200', '#d400ff', '#39ff14', '#ff2056', '#4d6bff', '#ff8c00'],
    boardBg: '#000000',
    gridColor: '#14141c',
    pageBg: '#000000',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const color = this.colors[colorIndex];
      const a = alpha ?? 1;
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = 2;
      context.globalAlpha = a * 0.35;
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.globalAlpha = a;
      context.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
      // resetear sombra para no afectar al resto del dibujo
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
      context.globalAlpha = 1;
    },
  },

  pastel: {
    name: 'Pastel',
    colors: [null, '#a8e6ef', '#fff3b0', '#e0bbf0', '#b9ebc4', '#ffb7b7', '#bcc4f5', '#ffd9a8'],
    boardBg: '#fdf6f0',
    gridColor: '#efe4dc',
    pageBg: '#4a3f5c', // fondo suave pero oscuro para mantener el contraste del HUD
    drawBlock(context, x, y, colorIndex, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      roundedPath(context, x * size + 2, y * size + 2, size - 4, size - 4, 8);
      context.fill();
      context.strokeStyle = 'rgba(0,0,0,0.12)';
      context.lineWidth = 1;
      context.stroke();
      // brillo suave
      context.fillStyle = 'rgba(255,255,255,0.45)';
      roundedPath(context, x * size + 6, y * size + 5, size - 14, 5, 2.5);
      context.fill();
      context.globalAlpha = 1;
    },
  },

  pixel: {
    name: 'Pixel art',
    colors: [null, '#29adff', '#ffec27', '#a755d6', '#00e436', '#ff004d', '#4b5bd6', '#ffa300'],
    boardBg: '#1d2b53',
    gridColor: '#25356a',
    pageBg: '#10183a',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const px = x * size + 1, py = y * size + 1, s = size - 2;
      const u = Math.max(2, Math.round(size / 10));
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.colors[colorIndex];
      context.fillRect(px, py, s, s);
      // biseles claro (arriba/izquierda) y oscuro (abajo/derecha)
      context.fillStyle = 'rgba(255,255,255,0.45)';
      context.fillRect(px, py, s, u);
      context.fillRect(px, py, u, s);
      context.fillStyle = 'rgba(0,0,0,0.4)';
      context.fillRect(px, py + s - u, s, u);
      context.fillRect(px + s - u, py, u, s);
      // patrón de píxeles interior (damero)
      context.fillStyle = 'rgba(0,0,0,0.15)';
      for (let i = u * 2, k = 0; i < s - u * 2; i += u * 2, k++)
        for (let j = u * 2, m = 0; j < s - u * 2; j += u * 2, m++)
          if ((k + m) % 2 === 0) context.fillRect(px + i, py + j, u, u);
      context.globalAlpha = 1;
    },
  },
};

let currentSkin = SKINS.retro;

function applySkin(name) {
  if (!SKINS[name]) name = 'retro';
  currentSkin = SKINS[name];
  const root = document.documentElement;
  root.style.setProperty('--page-bg', currentSkin.pageBg);
  root.style.setProperty('--board-bg', currentSkin.boardBg);
  const sel = document.getElementById('skin-select');
  if (sel) sel.value = name;
  return name;
}

function loadSavedSkin() {
  try { return localStorage.getItem(SKIN_KEY) || 'retro'; } catch (e) { return 'retro'; }
}

function saveSkin(name) {
  try { localStorage.setItem(SKIN_KEY, name); } catch (e) { /* sin almacenamiento */ }
}

function initSkinSelect(onChange) {
  const sel = document.getElementById('skin-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    saveSkin(applySkin(sel.value));
    sel.blur(); // evita que las flechas cambien el skin durante el juego
    onChange();
  });
}
