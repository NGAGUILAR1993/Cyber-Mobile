// Genera las guías estáticas de cybermobile.com.ar/guias a partir de guias/guias.json.
// Salida: guias/index.html y guias/<slug>/index.html (HTML sin JavaScript, para que carguen rápido
// y Google y los asistentes de IA lean el contenido completo).
// Seguridad: todo el texto se escapa; solo se permite **negrita**. Los links a fichas del Observatorio
// se validan contra observatorio/datos.json para no enlazar páginas que ya no existen.
// Uso: node scripts/guias/generar.mjs
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://www.cybermobile.com.ar';
const VERA = '/vera?o=guia';
const { guias } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'guias', 'guias.json'), 'utf8'));

// ---------- Fichas vigentes del Observatorio ----------
const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'observatorio', 'datos.json'), 'utf8'));
const slugDe = (k) => String(k || '').split('@')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const TILDES = [[/\binversion\b/gi, 'inversión'], [/\bprestamo\b/gi, 'préstamo'], [/\btelefono\b/gi, 'teléfono'], [/\bsuplantacion\b/gi, 'suplantación']];
const tildes = (t) => TILDES.reduce((s, [re, r]) => s.replace(re, r), String(t || ''));
const fichas = new Map([...(datos.top10 || []), ...(datos.watch || [])].map((x) => [slugDe(x.key), tildes(x.nombre)]));

// ---------- Utilidades ----------
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const plano = (s) => String(s || '').replace(/\*\*/g, '');
const SLUG_OK = /^[a-z0-9-]{3,80}$/;
const fechaLarga = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
// Ancho y alto reales de un JPEG (para reservar el espacio y que la página no salte al cargar).
function medidasJpeg(archivo) {
    const b = fs.readFileSync(archivo);
    for (let i = 2; i < b.length - 9;) {
        if (b[i] !== 0xFF) { i++; continue; }
        const m = b[i + 1], largo = b.readUInt16BE(i + 2);
        if (m >= 0xC0 && m <= 0xC3) return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
        i += 2 + largo;
    }
    throw new Error('No se pudo leer el tamaño de ' + archivo);
}
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// Validación del contenido: si algo no cumple, el generador falla (y el workflow no publica).
const slugs = new Set();
for (const g of guias) {
    if (!SLUG_OK.test(g.slug) || slugs.has(g.slug)) throw new Error('Slug inválido o repetido: ' + g.slug);
    slugs.add(g.slug);
    for (const k of ['titulo', 'h1', 'descripcion', 'resumen', 'publicada']) if (!g[k]) throw new Error(`${g.slug}: falta ${k}`);
    if (g.descripcion.length > 170) console.warn(`Aviso: ${g.slug}: la descripción supera 170 caracteres (${g.descripcion.length}).`);
    if (g.caso && !/^[a-z0-9-]+\.(jpg|webp|png)$/.test(g.caso.imagen)) throw new Error(`${g.slug}: imagen inválida`);
}

const CSS = `
@font-face{font-family:'Space Grotesk';src:url(/observatorio/fuentes/SpaceGrotesk.ttf) format('truetype');font-weight:300 700;font-display:swap}
@font-face{font-family:'JetBrains Mono';src:url(/observatorio/fuentes/JetBrainsMono.ttf) format('truetype');font-weight:100 800;font-display:swap}
:root{--bg:#05070D;--line:rgba(148,163,184,.14);--line2:rgba(148,163,184,.28);--txt:#E6EDF7;--txt2:#C3CEDD;--muted:#9AA8BD;--acc:#22D3EE;--ink:#04121A;--pad:clamp(16px,5.5vw,80px)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}
body{margin:0;background:var(--bg);color:var(--txt);font-family:'Space Grotesk',system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--acc);text-decoration:none}a:hover{color:#67E8F9;text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:6px}
img{max-width:100%;height:auto;display:block}
.wrap{max-width:1180px;margin:0 auto;padding:0 var(--pad)}
.top{position:sticky;top:0;z-index:50;background:rgba(5,7,13,.88);border-bottom:1px solid rgba(148,163,184,.1)}
.top .wrap{height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:12px;color:var(--txt);font-weight:700;letter-spacing:.14em;font-size:15px}.brand:hover{color:var(--txt);text-decoration:none}
.brand img{width:36px;height:36px;border-radius:10px}
.menu{display:flex;gap:24px;font-size:15px}.menu a{color:var(--muted)}.menu a:hover{color:var(--txt)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 22px;border-radius:14px;font-weight:600;font-size:16px}
.btn-p{background:var(--acc);color:var(--ink)}.btn-p:hover{color:var(--ink);opacity:.92;text-decoration:none}
.btn-g{border:1px solid var(--line2);color:var(--txt)}.btn-g:hover{color:var(--txt);border-color:var(--acc);text-decoration:none}
.crumbs{display:flex;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--muted);margin:32px 0 0;padding:0;list-style:none}
.crumbs a{color:var(--muted)}.crumbs li+li::before{content:'›';margin-right:8px}
.kick{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.2em;color:var(--acc);text-transform:uppercase;margin-top:22px}
h1{font-size:clamp(30px,4.4vw,50px);line-height:1.08;font-weight:700;letter-spacing:-.025em;margin:12px 0 14px}
.meta{font-size:14px;color:var(--muted)}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:48px;align-items:start;padding-top:28px}
article{display:flex;flex-direction:column;gap:40px;min-width:0;max-width:760px}
h2{font-size:clamp(22px,2.4vw,28px);font-weight:700;letter-spacing:-.015em;margin:0 0 14px}
.res{padding:24px 26px;border-radius:20px;border:1px solid rgba(34,211,238,.35);background:linear-gradient(120deg,rgba(34,211,238,.09),rgba(10,15,28,.4) 70%)}
.res b{display:block;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.18em;color:var(--acc);margin-bottom:10px}
.res p{margin:0;font-size:18.5px;line-height:1.6}
article p,article li{font-size:17.5px;line-height:1.7;color:var(--txt2)}article strong{color:var(--txt)}
article ul,article ol{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:10px}
.caso{border:1px solid var(--line);border-radius:20px;padding:22px;display:grid;grid-template-columns:220px 1fr;gap:22px;align-items:center;background:rgba(255,255,255,.02)}
.caso img{border-radius:14px;border:1px solid var(--line2)}
.caso p{margin:8px 0 0}
.lbl{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase}
.vera{padding:26px;border-radius:22px;background:radial-gradient(120% 100% at 100% 0%,rgba(34,211,238,.2),rgba(10,15,28,.9) 70%);border:1px solid rgba(34,211,238,.35);display:flex;flex-direction:column;gap:12px}
.vera b{font-size:22px;line-height:1.25}.vera span{font-size:15.5px;line-height:1.55;color:var(--txt2)}
details{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.02)}details+details{margin-top:10px}
summary{cursor:pointer;padding:18px 22px;font-size:17px;font-weight:600;list-style:none}summary::-webkit-details-marker{display:none}
summary::after{content:'+';float:right;color:var(--acc)}details[open] summary::after{content:'–'}
details p{margin:0;padding:0 22px 20px}
aside{display:flex;flex-direction:column;gap:14px;position:sticky;top:90px}
.box{border:1px solid var(--line);border-radius:18px;padding:20px 22px;display:flex;flex-direction:column;gap:8px}
.box a{font-size:15px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:28px}
.card{border:1px solid var(--line);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:10px;color:var(--txt);background:rgba(255,255,255,.02)}
.card:hover{border-color:rgba(34,211,238,.45);text-decoration:none;color:var(--txt)}
.card b{font-size:19px;line-height:1.3}.card span{font-size:15px;color:var(--txt2)}
.intro{font-size:18px;color:var(--txt2);max-width:760px;margin:0}
footer{margin-top:72px;border-top:1px solid rgba(148,163,184,.1)}
footer .wrap{padding-top:26px;padding-bottom:26px;display:flex;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;font-size:14px;color:#8391A7}
@media(max-width:960px){.layout{grid-template-columns:1fr}aside{position:static}.menu{display:none}}
@media(max-width:640px){.caso{grid-template-columns:1fr}.top .btn span{display:none}.res p{font-size:17px}}
`;

function documento({ titulo, descripcion, url, jsonld, cuerpo, tipo }) {
    return `<!DOCTYPE html>
<html lang="es-AR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#05070D">
<meta property="og:type" content="${tipo}"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Cyber Mobile">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descripcion)}"><meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITIO}/Escudo%20CM.jpeg"><meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/observatorio/fuentes/SpaceGrotesk.ttf" as="font" type="font/ttf" crossorigin>
${jsonld.map(ld).join('\n')}
<style>${CSS}</style>
</head><body>
<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="Cyber Mobile, inicio"><img src="/logo-cm.png" alt="" width="36" height="36">CYBER MOBILE</a>
<nav class="menu" aria-label="Sitio"><a href="/guias">Guías</a><a href="/observatorio">Observatorio</a><a href="/agente">Probá Vera</a><a href="/#planes">Planes</a></nav>
<a class="btn btn-p" href="${VERA}" rel="nofollow">💬 <span>Probá Vera gratis</span></a>
</div></header>
<main id="contenido"><div class="wrap">${cuerpo}</div></main>
<footer><div class="wrap"><span>Cyber Mobile · Agente antiestafas por WhatsApp · Observatorio de Fraude Digital</span><span><a href="/privacidad.html">Privacidad</a> · © ${new Date().getUTCFullYear()} Cyber Mobile</span></div></footer>
</body></html>
`;
}

const ORG = { '@type': 'Organization', name: 'Cyber Mobile', url: SITIO + '/', logo: SITIO + '/Escudo%20CM.jpeg' };
const veraBox = (frase) => `<div class="vera"><b>${esc(frase)}</b><span>Reenviale el mensaje, el link, el número o la captura a Vera por WhatsApp. Te responde en segundos con un semáforo y qué hacer.</span><a class="btn btn-p" href="${VERA}" rel="nofollow">Probala 7 días gratis</a></div>`;

function paginaGuia(g) {
    const url = `${SITIO}/guias/${g.slug}`;
    const secciones = (g.secciones || []).map((s) => {
        const items = (s.lista || s.numerada || []).map((t) => `<li>${md(t)}</li>`).join('');
        const tag = s.numerada ? 'ol' : 'ul';
        return `<section><h2>${esc(s.h2)}</h2>${s.p ? s.p.map((t) => `<p>${md(t)}</p>`).join('') : ''}${items ? `<${tag}>${items}</${tag}>` : ''}</section>`;
    }).join('');
    const med = g.caso ? medidasJpeg(path.join(RAIZ, 'guias', 'img', g.caso.imagen)) : null;
    const caso = g.caso ? `<section><h2>Caso real: así responde Vera</h2><div class="caso"><img src="/guias/img/${esc(g.caso.imagen)}" alt="${esc(g.caso.alt)}" width="${med.ancho}" height="${med.alto}" loading="lazy" decoding="async"><div><span class="lbl">Respuesta real · datos personales tapados</span><p>${md(g.caso.texto)}</p></div></div></section>` : '';
    const faq = (g.faq || []).length ? `<section><h2>Preguntas frecuentes</h2>${g.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${md(f.a)}</p></details>`).join('')}</section>` : '';
    const rel = (g.relacionadas || []).map((s) => guias.find((x) => x.slug === s)).filter(Boolean);
    const fich = (g.fichas || []).filter((s) => fichas.has(s));
    const aside = `<aside>${veraBox('¿Te llegó algo así? No adivines.')}
${rel.length ? `<div class="box"><span class="lbl">Otras guías</span>${rel.map((r) => `<a href="/guias/${r.slug}">${esc(r.h1)}</a>`).join('')}</div>` : ''}
${fich.length ? `<div class="box"><span class="lbl">Estafas que circulan hoy</span>${fich.map((s) => `<a href="/observatorio/${s}">${esc(fichas.get(s))}</a>`).join('')}<a href="/observatorio">Ver el ranking del mes →</a></div>` : ''}</aside>`;
    const cuerpo = `<ol class="crumbs"><li><a href="/">Inicio</a></li><li><a href="/guias">Guías</a></li><li aria-current="page">${esc(g.h1)}</li></ol>
<div class="kick">Guía · Ciberseguridad para todos</div>
<h1>${esc(g.h1)}</h1>
<p class="meta">Actualizada el ${fechaLarga(g.actualizada || g.publicada)} · Equipo de Cyber Mobile</p>
<div class="layout"><article>
<div class="res"><b>RESPUESTA RÁPIDA</b><p>${md(g.resumen)}</p></div>
${secciones}${caso}${veraBox('¿No querés revisarlo vos? Mandáselo a Vera.')}${faq}
</article>${aside}</div>`;
    const jsonld = [
        { '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, description: g.descripcion, inLanguage: 'es-AR', mainEntityOfPage: url,
            datePublished: g.publicada, dateModified: g.actualizada || g.publicada, author: ORG, publisher: ORG, image: SITIO + '/Escudo%20CM.jpeg' },
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO + '/' },
            { '@type': 'ListItem', position: 2, name: 'Guías', item: SITIO + '/guias' },
            { '@type': 'ListItem', position: 3, name: g.h1, item: url }] }
    ];
    if ((g.faq || []).length) jsonld.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: g.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plano(f.a) } })) });
    return documento({ titulo: g.titulo, descripcion: g.descripcion, url, jsonld, cuerpo, tipo: 'article' });
}

function paginaIndice() {
    const url = `${SITIO}/guias`;
    const cuerpo = `<ol class="crumbs"><li><a href="/">Inicio</a></li><li aria-current="page">Guías</li></ol>
<div class="kick">Guías de ciberseguridad</div>
<h1>Cómo darte cuenta de una estafa antes de que pase</h1>
<p class="intro">Guías simples y prácticas para verificar mensajes, links, números y cuentas en Argentina. Y si no querés revisarlo vos, se lo mandás a Vera por WhatsApp.</p>
<div class="cards">${guias.map((g) => `<a class="card" href="/guias/${g.slug}"><b>${esc(g.h1)}</b><span>${esc(g.descripcion)}</span></a>`).join('')}</div>
<div style="margin-top:36px;max-width:760px">${veraBox('Tu verificador antiestafas en WhatsApp')}</div>`;
    const jsonld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Guías de ciberseguridad · Cyber Mobile', url, inLanguage: 'es-AR',
        hasPart: guias.map((g) => ({ '@type': 'Article', headline: g.h1, url: `${SITIO}/guias/${g.slug}` })) }];
    return documento({ titulo: 'Guías: cómo detectar estafas por WhatsApp, links y llamadas · Cyber Mobile',
        descripcion: 'Guías prácticas para verificar si un mensaje, link, número o cuenta es una estafa en Argentina, con casos reales y qué hacer si ya caíste.', url, jsonld, cuerpo, tipo: 'website' });
}

// ---------- Escritura ----------
const salida = path.join(RAIZ, 'guias');
for (const d of fs.readdirSync(salida, { withFileTypes: true })) {
    if (d.isDirectory() && d.name !== 'img' && !slugs.has(d.name)) fs.rmSync(path.join(salida, d.name), { recursive: true });
}
fs.writeFileSync(path.join(salida, 'index.html'), paginaIndice());
for (const g of guias) {
    fs.mkdirSync(path.join(salida, g.slug), { recursive: true });
    fs.writeFileSync(path.join(salida, g.slug, 'index.html'), paginaGuia(g));
}
// Bloque "Guías" de la portada (entre las marcas guias:inicio y guias:fin): las 3 más recientes.
const portada = path.join(RAIZ, 'index.html');
const html = fs.readFileSync(portada, 'utf8');
const marca = /(<!-- guias:inicio[^>]*-->)[\s\S]*?(\s*<!-- guias:fin -->)/;
if (!marca.test(html)) throw new Error('index.html no tiene las marcas guias:inicio / guias:fin');
const recientes = [...guias].sort((a, b) => (b.actualizada || b.publicada).localeCompare(a.actualizada || a.publicada)).slice(0, 3);
const bloque = `\n            <div class="guias-home reveal">\n${recientes.map((g) => `                <a class="tile guia-card" href="/guias/${g.slug}" data-track="home_guia"><b>${esc(g.h1)}</b><span>${esc(g.descripcion)}</span><em>Leer la guía →</em></a>`).join('\n')}\n            </div>`;
fs.writeFileSync(portada, html.replace(marca, (m, a, b) => a + bloque + b));
fs.writeFileSync(path.join(salida, 'lista.json'), JSON.stringify(guias.map((g) => ({ slug: g.slug, fecha: g.actualizada || g.publicada })), null, 1) + '\n');
console.log(`Guías generadas: ${guias.length} (${guias.map((g) => g.slug).join(', ')})`);
