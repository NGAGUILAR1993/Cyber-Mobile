// Archivo de fichas del Observatorio: guarda la última versión de cada estafa que pasó por el ranking
// o por "en vigilancia", así su página /observatorio/<slug> sigue viva cuando sale del ranking del mes.
// Uso:
//   node scripts/observatorio/archivar.mjs            suma lo de observatorio/datos.json al archivo
//   node scripts/observatorio/archivar.mjs --historia recorre todas las versiones de datos.json en git
// Escribe observatorio/archivo.json solo si cambió.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { modalidades } from '../../api/_lib/observatorio.js';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DATOS = 'observatorio/datos.json';
const ARCHIVO = path.join(RAIZ, 'observatorio', 'archivo.json');
// Campos que necesita la ficha; el resto (mapa, kpi, etc.) no se guarda.
const CAMPOS = ['key', 'nombre', 'canal', 'riesgo', 'act', 'como', 'detectar', 'provincias', 'evidencias', 'url', 'fuente', 'seccion', 'pos'];

const previo = fs.existsSync(ARCHIVO) ? JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')) : { modalidades: {} };
const fichas = { ...previo.modalidades };

function sumar(d) {
    if (!d || !Array.isArray(d.top10)) return;
    const mes = (d.meta && d.meta.mes) || '';
    const visto = (d.meta && d.meta.actualizado) || '';
    for (const m of modalidades(d)) {
        if (!m.como || !m.detectar) continue;
        const anterior = fichas[m.slug];
        if (anterior && anterior.visto && visto && anterior.visto > visto) continue;
        const f = {};
        for (const c of CAMPOS) if (m[c] !== undefined) f[c] = m[c];
        // Si solo cambiaron el índice, la posición o la fecha, no se reescribe: así el archivo cambia
        // pocas veces (y no dispara un deploy de Vercel con cada actualización de n8n).
        const firma = (x) => { const y = { ...x, act: 0, pos: 0, seccion: '', visto: '' }; return JSON.stringify(Object.keys(y).sort().map((k) => [k, y[k]])); };
        if (anterior && firma(anterior) === firma({ ...f, mes })) continue;
        fichas[m.slug] = { ...f, mes, visto };
    }
}

if (process.argv.includes('--historia')) {
    const shas = execFileSync('git', ['log', '--format=%H', '--reverse', '--', DATOS], { cwd: RAIZ, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    for (const sha of shas) {
        try { sumar(JSON.parse(execFileSync('git', ['show', `${sha}:${DATOS}`], { cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 << 20 }))); } catch { /* versión rota: se saltea */ }
    }
}
sumar(JSON.parse(fs.readFileSync(path.join(RAIZ, DATOS), 'utf8')));

const ordenadas = Object.fromEntries(Object.keys(fichas).sort().map((k) => [k, fichas[k]]));
const nuevo = JSON.stringify({ nota: 'Lo genera scripts/observatorio/archivar.mjs. No editar a mano.', modalidades: ordenadas }, null, 1) + '\n';
if (!fs.existsSync(ARCHIVO) || fs.readFileSync(ARCHIVO, 'utf8') !== nuevo) {
    fs.writeFileSync(ARCHIVO, nuevo);
    console.log('archivo.json actualizado:', Object.keys(ordenadas).length, 'fichas');
} else console.log('archivo.json sin cambios:', Object.keys(ordenadas).length, 'fichas');
