'use strict';

// Tabla de records local (localStorage). Todo acceso va en try/catch.
const RECORDS_KEY = 'tetris.records';
const RECORDS_MAX = 5;

let recordsData = loadRecords();

function loadRecords() {
  const empty = { top: [], bestCombo: 0, maxLines: 0 };
  try {
    const raw = JSON.parse(localStorage.getItem(RECORDS_KEY));
    if (!raw || !Array.isArray(raw.top)) return empty;
    return {
      top: raw.top.filter(r => r && typeof r.score === 'number').slice(0, RECORDS_MAX),
      bestCombo: Number(raw.bestCombo) || 0,
      maxLines: Number(raw.maxLines) || 0,
    };
  } catch (e) {
    return empty;
  }
}

function saveRecords() {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(recordsData));
  } catch (e) { /* sin localStorage: se mantiene en memoria */ }
}

// ¿Entra esta puntuación en el top?
function qualifiesForTop(sc) {
  if (sc <= 0) return false;
  return recordsData.top.length < RECORDS_MAX || sc > recordsData.top[recordsData.top.length - 1].score;
}

// Actualiza mejor combo y líneas máximas al terminar la partida
function updateRecordStats(combo, lns) {
  recordsData.bestCombo = Math.max(recordsData.bestCombo, combo);
  recordsData.maxLines = Math.max(recordsData.maxLines, lns);
  saveRecords();
}

// Inserta un record y devuelve su índice en el top
function addRecord(name, sc, lns, lvl) {
  const entry = {
    name: (name || '').trim().slice(0, 12) || 'Anónimo',
    score: sc, lines: lns, level: lvl, date: new Date().toISOString(),
  };
  // en empate, el nuevo queda por debajo de los existentes
  let idx = recordsData.top.findIndex(r => sc > r.score);
  if (idx === -1) idx = recordsData.top.length;
  recordsData.top.splice(idx, 0, entry);
  recordsData.top.length = Math.min(recordsData.top.length, RECORDS_MAX);
  saveRecords();
  return idx;
}

function resetRecords() {
  recordsData = { top: [], bestCombo: 0, maxLines: 0 };
  try { localStorage.removeItem(RECORDS_KEY); } catch (e) { /* ignorar */ }
}

// Dibuja tabla + estadísticas en `container`; `highlight` = índice a resaltar
function renderRecords(container, highlight) {
  container.textContent = '';
  const table = document.createElement('table');
  table.className = 'records-table';
  const head = table.createTHead().insertRow();
  ['#', 'Nombre', 'Puntos', 'Líneas'].forEach(t => {
    const th = document.createElement('th');
    th.textContent = t;
    head.appendChild(th);
  });
  const body = table.createTBody();
  if (!recordsData.top.length) {
    const td = body.insertRow().insertCell();
    td.colSpan = 4;
    td.className = 'records-empty';
    td.textContent = 'Sin records todavía';
  }
  recordsData.top.forEach((r, i) => {
    const tr = body.insertRow();
    if (i === highlight) tr.className = 'highlight';
    [i + 1, r.name, Number(r.score).toLocaleString(), r.lines].forEach(v => {
      tr.insertCell().textContent = v;
    });
  });
  const stats = document.createElement('p');
  stats.className = 'records-stats';
  stats.textContent = `Mejor combo: ${recordsData.bestCombo} · Líneas máximas: ${recordsData.maxLines}`;
  container.append(table, stats);
}
