// Sitemap dinámico: portada, Observatorio, una URL por cada estafa vigente y las guías.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cargarDatos, modalidades, SITIO } from './_lib/observatorio.js';

// guias/lista.json lo genera scripts/guias/generar.mjs: [{ slug, fecha }]
function guias() {
    try {
        const l = JSON.parse(readFileSync(join(process.cwd(), 'guias', 'lista.json'), 'utf8'));
        return l.filter((g) => /^[a-z0-9-]{3,80}$/.test(g.slug) && /^\d{4}-\d{2}-\d{2}$/.test(g.fecha));
    } catch (e) { console.error('sitemap.js: guías', e.message); return []; }
}

export default function handler(req, res) {
    let d = null;
    try { d = cargarDatos(); } catch (e) { console.error('sitemap.js:', e.message); }
    const hoy = new Date().toISOString().slice(0, 10);
    const act = (d && d.meta && String(d.meta.actualizado || '').slice(0, 10)) || hoy;
    const urls = [
        { loc: `${SITIO}/`, lastmod: act, freq: 'weekly', pri: '1.0' },
        { loc: `${SITIO}/observatorio`, lastmod: act, freq: 'daily', pri: '0.9' },
        { loc: `${SITIO}/agente`, lastmod: '2026-10-01', freq: 'monthly', pri: '0.9' },
        { loc: `${SITIO}/extension`, lastmod: '2026-10-27', freq: 'monthly', pri: '0.8' },
        { loc: `${SITIO}/privacidad.html`, lastmod: '2026-10-01', freq: 'yearly', pri: '0.3' }
    ];
    const lista = guias();
    if (lista.length) {
        urls.push({ loc: `${SITIO}/guias`, lastmod: lista.map((g) => g.fecha).sort().pop(), freq: 'weekly', pri: '0.8' });
        for (const g of lista) urls.push({ loc: `${SITIO}/guias/${g.slug}`, lastmod: g.fecha, freq: 'monthly', pri: '0.8' });
    }
    if (d) {
        for (const m of modalidades(d)) {
            urls.push({ loc: `${SITIO}/observatorio/${m.slug}`, lastmod: act, freq: 'weekly', pri: m.seccion === 'top' ? '0.8' : '0.6' });
        }
    }
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n') +
        '\n</urlset>\n';
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.end(xml);
}
