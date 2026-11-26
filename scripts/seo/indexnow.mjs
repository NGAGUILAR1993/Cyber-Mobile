// IndexNow: avisa a Bing (que alimenta la búsqueda de ChatGPT y Copilot), Yandex, Seznam y Naver
// que hay páginas nuevas o cambiadas, sin esperar a que el robot pase solo. Gratis y sin cuenta.
// La clave es pública por diseño: es el archivo <32 hex>.txt de la raíz, que el buscador lee para
// confirmar que el sitio es nuestro. Este script la busca sola (no hay que copiarla en ningún lado).
// Uso: node scripts/seo/indexnow.mjs            -> todas las URLs del sitemap publicado
//      node scripts/seo/indexnow.mjs /guias/x /observatorio   -> solo esas rutas
// Corre solo desde .github/workflows/indexnow.yml después de cada cambio del sitio en main.
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://www.cybermobile.com.ar';
const HOST = 'www.cybermobile.com.ar';

const archivo = fs.readdirSync(RAIZ).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!archivo) throw new Error('Falta el archivo de clave <32 hex>.txt en la raíz del sitio');
const clave = archivo.slice(0, -4);
if (fs.readFileSync(path.join(RAIZ, archivo), 'utf8').trim() !== clave) throw new Error('El archivo de clave no contiene su propio nombre');

async function urlsDelSitemap() {
    const r = await fetch(`${SITIO}/sitemap.xml`, { headers: { 'User-Agent': 'cm-indexnow' } });
    if (!r.ok) throw new Error(`sitemap.xml respondió ${r.status}`);
    const xml = await r.text();
    return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITIO));
}

const rutas = process.argv.slice(2);
const urls = rutas.length ? rutas.map((r) => (r.startsWith('http') ? r : SITIO + (r.startsWith('/') ? r : '/' + r))) : await urlsDelSitemap();
if (!urls.length) throw new Error('No hay URLs para avisar');

// La clave tiene que estar publicada antes de avisar (si no, el buscador la rechaza con 403).
const k = await fetch(`${SITIO}/${archivo}`);
if (!k.ok || (await k.text()).trim() !== clave) throw new Error(`La clave todavía no está publicada en ${SITIO}/${archivo} (¿falta el deploy?)`);

const cuerpo = { host: HOST, key: clave, keyLocation: `${SITIO}/${archivo}`, urlList: urls.slice(0, 10000) };
const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(cuerpo)
});
// 200 = recibido; 202 = recibido, la clave se valida después. 4xx = error de nuestro lado.
console.log(`IndexNow: ${urls.length} URLs, respuesta ${r.status}`);
if (r.status >= 400) { console.error(await r.text()); process.exit(1); }
