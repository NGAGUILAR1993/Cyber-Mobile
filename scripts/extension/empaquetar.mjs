// Arma el .zip de la extensión de Chrome para subir a la Chrome Web Store.
// Uso: node scripts/extension/empaquetar.mjs  →  extension/dist/vera-chrome-<versión>.zip
// Solo entra lo que necesita la extensión (sin la ficha, las capturas de la tienda ni el dist).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const RAIZ = new URL('../../extension/', import.meta.url).pathname;
const { version } = JSON.parse(fs.readFileSync(RAIZ + 'manifest.json', 'utf8'));
const ARCHIVOS = ['manifest.json', 'sw.js', 'api.js', 'panel.html', 'panel.css', 'panel.js', 'icons', 'fonts'];
fs.mkdirSync(RAIZ + 'dist', { recursive: true });
const salida = `dist/vera-chrome-${version}.zip`;
fs.rmSync(RAIZ + salida, { force: true });
execFileSync('zip', ['-r', '-X', '-q', salida, ...ARCHIVOS], { cwd: RAIZ, stdio: 'inherit' });
console.log('Listo:', 'extension/' + salida, Math.round(fs.statSync(RAIZ + salida).size / 1024) + ' KB');
