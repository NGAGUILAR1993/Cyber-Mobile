// Servidor de staging: sirve la web de Cyber Mobile igual que Vercel, pero en tu computadora,
// para poder correrle un análisis de seguridad (ZAP, Nuclei, Nikto, Shannon) SIN tocar producción.
//
// Imita de vercel.json: las reescrituras de ruta (/vera, /observatorio/<slug>, /sitemap.xml, ...)
// y los encabezados de seguridad (CSP, HSTS, etc.). Adapta la firma (req,res) de las funciones de
// Vercel a un servidor http común. No publica /scripts, /app, /docs, /extension ni /.github (igual
// que .vercelignore). Redis y n8n apuntan a servicios locales de mentira (ver docker-compose.yml).
//
// Uso local (sin Docker):  REDIS_URL=redis://localhost:6379 N8N_WEB_URL=http://localhost:5699/vera node scripts/staging/servidor.mjs
// Con Docker:              docker compose -f scripts/staging/docker-compose.yml up --build
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const RAIZ = process.env.CM_RAIZ || process.cwd();
const PUERTO = Number(process.env.PORT || 8080);
const vercel = JSON.parse(await readFile(join(RAIZ, 'vercel.json'), 'utf8'));

// Rutas que no se publican en el sitio (de .vercelignore). Shannon no debe ver el código fuente del server.
const OCULTO = [/^\/scripts\//, /^\/app\//, /^\/docs\//, /^\/extension\//, /^\/\.github\//, /^\/\.claude\//, /^\/\.git\//, /^\/node_modules\//];

const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8'
};

// "/guias/:slug([a-z0-9-]+)" -> expresión regular con grupos nombrados.
function aRegex(patron) {
    let re = '^' + patron.replace(/[.]/g, '\\.').replace(/:([a-zA-Z]+)(\(([^)]+)\))?/g, (_, n, __, g) => `(?<${n}>${g || '[^/]+'})`) + '$';
    return new RegExp(re);
}
const REESCRITURAS = (vercel.rewrites || []).map((r) => ({ re: aRegex(r.source), destino: r.destination }));
const REDIRECCIONES = (vercel.redirects || []).map((r) => ({ re: aRegex(r.source), destino: r.destination, permanente: r.permanent }));

// Encabezados de seguridad de vercel.json que correspondan a la ruta.
function encabezados(ruta) {
    const salida = {};
    for (const h of vercel.headers || []) {
        try { if (aRegex(h.source).test(ruta)) for (const x of h.headers) salida[x.key] = x.value; } catch { /* patrón raro: se saltea */ }
    }
    return salida;
}

// Adapta res de http al que esperan las funciones (status().send().json(), etc.).
function adaptar(res) {
    res.status = (c) => { res.statusCode = c; return res; };
    res.send = (b) => { res.end(typeof b === 'string' || Buffer.isBuffer(b) ? b : String(b)); return res; };
    res.json = (o) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); return res; };
    return res;
}

async function leerCuerpo(req) {
    if (req.method !== 'POST' && req.method !== 'PUT') return undefined;
    const trozos = [];
    for await (const t of req) { trozos.push(t); if (Buffer.concat(trozos).length > 6 * 1024 * 1024) break; }
    const txt = Buffer.concat(trozos).toString('utf8');
    if ((req.headers['content-type'] || '').includes('application/json')) { try { return JSON.parse(txt); } catch { return txt; } }
    return txt;
}

const cacheFunc = new Map();
async function funcion(archivo) {
    if (!cacheFunc.has(archivo)) cacheFunc.set(archivo, (await import('file://' + join(RAIZ, archivo))).default);
    return cacheFunc.get(archivo);
}

async function servirEstatico(rutaRel, res, headExtra) {
    const limpio = normalize(rutaRel).replace(/^(\.\.(\/|\\|$))+/, '');
    let abs = join(RAIZ, limpio);
    try {
        let s = await stat(abs).catch(() => null);
        if (s && s.isDirectory()) { abs = join(abs, 'index.html'); s = await stat(abs).catch(() => null); }
        if (!s) return false;
        const buf = await readFile(abs);
        res.statusCode = 200;
        res.setHeader('Content-Type', MIME[extname(abs).toLowerCase()] || 'application/octet-stream');
        for (const [k, v] of Object.entries(headExtra || {})) res.setHeader(k, v);
        res.end(buf);
        return true;
    } catch { return false; }
}

const servidor = http.createServer(async (req, res) => {
    adaptar(res);
    const url = new URL(req.url, 'http://localhost');
    const ruta = decodeURIComponent(url.pathname);
    req.query = Object.fromEntries(url.searchParams);

    // 1) No publicar el código interno.
    if (OCULTO.some((re) => re.test(ruta))) { res.statusCode = 404; return res.end('Not found'); }

    const head = encabezados(ruta);

    // 2) Redirecciones (/chrome -> tienda).
    for (const r of REDIRECCIONES) {
        if (r.re.test(ruta)) { res.statusCode = r.permanente ? 308 : 307; res.setHeader('Location', r.destino); return res.end(); }
    }

    // 3) Reescrituras -> función de api/ o archivo estático.
    let destino = null;
    for (const r of REESCRITURAS) {
        const m = r.re.exec(ruta);
        if (m) { destino = r.destino.replace(/:([a-zA-Z]+)/g, (_, n) => (m.groups && m.groups[n]) || ''); break; }
    }
    const efectiva = destino || ruta;

    // 4) Función de api/.
    const mApi = efectiva.match(/^\/(api\/[a-zA-Z0-9/_-]+?)(\.js)?(\?.*)?$/);
    if (efectiva.startsWith('/api/') || (destino && destino.startsWith('/api/'))) {
        const [camino, qs] = efectiva.replace(/^\//, '').split('?');
        const archivo = camino.endsWith('.js') ? camino : camino + '.js';
        try {
            const fn = await funcion(archivo);
            if (qs) for (const [k, v] of new URLSearchParams(qs)) req.query[k] = v;
            req.body = await leerCuerpo(req);
            for (const [k, v] of Object.entries(head)) res.setHeader(k, v);
            return await fn(req, res);
        } catch (e) {
            console.error('api', archivo, e.message);
            res.statusCode = 500; return res.end('Error de función: ' + e.message);
        }
    }

    // 5) Archivo estático (con rutas limpias: /privacidad -> /privacidad.html).
    if (await servirEstatico(efectiva, res, head)) return;
    if (!extname(efectiva) && await servirEstatico(efectiva + '.html', res, head)) return;
    if (await servirEstatico(join(efectiva, 'index.html'), res, head)) return;

    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    for (const [k, v] of Object.entries(head)) res.setHeader(k, v);
    res.end('<!doctype html><title>404</title><h1>404</h1>');
});

servidor.listen(PUERTO, () => console.log(`Staging de Cyber Mobile en http://localhost:${PUERTO}  (raíz: ${RAIZ})`));
