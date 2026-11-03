// Aplica la tabla canónica de gravedad (observatorio/gravedad.json) al campo `riesgo`
// de cada modalidad en datos.json (top10, watch y las snapshots de informes), y recalcula
// la caja "Nivel de riesgo" (alto/medio/bajo) de cada informe a partir de su propio Top.
// Idempotente: si ya está aplicado, no cambia nada. Uso: node scripts/observatorio/gravedad.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const datosPath = join(raiz, 'observatorio', 'datos.json');
const grav = JSON.parse(readFileSync(join(raiz, 'observatorio', 'gravedad.json'), 'utf8'));
const NIV = grav.niveles || {};

const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const sinClasificar = new Set();

function nivel(x) {
  const n = NIV[norm(x && x.nombre)];
  if (n) return n;
  if (x && x.nombre) sinClasificar.add(x.nombre);
  return (x && x.riesgo) || 'medio'; // respaldo: lo que ya tenía, o medio
}

function aplicarLista(lista) {
  (lista || []).forEach((x) => { if (x && x.nombre) x.riesgo = nivel(x); });
}

const datos = JSON.parse(readFileSync(datosPath, 'utf8'));
aplicarLista(datos.top10);
aplicarLista(datos.watch);
aplicarLista(datos.internacional);
(datos.informes || []).forEach((inf) => {
  aplicarLista(inf.top);
  aplicarLista(inf.watch);
  // Caja de riesgo = conteo de gravedad del propio Top del informe.
  const caja = { alto: 0, medio: 0, bajo: 0 };
  (inf.top || []).forEach((x) => { const n = nivel(x); if (caja[n] != null) caja[n]++; });
  inf.riesgo = caja;
});

writeFileSync(datosPath, JSON.stringify(datos, null, 2) + '\n');
console.log('OK: gravedad aplicada a datos.json');
if (sinClasificar.size) {
  console.log('AVISO: modalidades sin clasificar en gravedad.json (quedaron con su valor previo):');
  [...sinClasificar].forEach((n) => console.log('  -', n));
} else {
  console.log('Todas las modalidades están clasificadas.');
}
