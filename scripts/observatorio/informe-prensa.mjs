// Informe de prensa del Observatorio de Fraude Digital: página estática (sin JavaScript) con el dato de
// titular, tabla del Top 10 con fuente y metodología corta, para que medios y sitios lo citen y enlacen.
// Todo sale de observatorio/datos.json (+ gravedad.json para el nivel de riesgo). Nada se inventa:
// si un dato no existe, la sección se omite.
// Uso: node scripts/observatorio/informe-prensa.mjs   -> informe-fraude-digital/index.html
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const SITIO = 'https://www.cybermobile.com.ar';
const d = JSON.parse(fs.readFileSync(path.join(RAIZ, 'observatorio', 'datos.json'), 'utf8'));
const grav = JSON.parse(fs.readFileSync(path.join(RAIZ, 'observatorio', 'gravedad.json'), 'utf8')).niveles;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sinTilde = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const TILDES = [[/\binversion\b/gi, 'inversión'], [/\bprestamo\b/gi, 'préstamo'], [/\btelefono\b/gi, 'teléfono'], [/\bsuplantacion\b/gi, 'suplantación'], [/\bromantico\b/gi, 'romántico'], [/\bpaqueteria\b/gi, 'paquetería'], [/\btramite\b/gi, 'trámite'], [/\bsoporte tecnico\b/gi, 'soporte técnico']];
const nombre = (t) => TILDES.reduce((s, [re, r]) => s.replace(re, r), String(t || ''));
const slugDe = (k) => sinTilde(String(k || '').split('@')[0]).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const CANAL = { MAIL: 'Email', WHATSAPP: 'WhatsApp', SMS: 'SMS', REDES: 'Redes sociales', TELEFONO: 'Teléfono', APP: 'App' };
const canal = (c) => CANAL[sinTilde(c).toUpperCase()] || String(c || '');
const riesgoDe = (x) => grav[sinTilde(x.nombre)] || x.riesgo;   // gravedad.json manda
const fechaLarga = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });

const top = (d.top10 || []).map((x) => ({ ...x, riesgoF: riesgoDe(x) }));
if (top.length < 3) throw new Error('datos.json sin Top 10');
const resto = (d.watch || []).map((x) => ({ ...x, riesgoF: riesgoDe(x) }));
const mes = d.meta.mes;                       // "noviembre de 2026"
const informes = (d.informes || []).filter((i) => i.id !== '2026-08').sort((a, b) => (a.id < b.id ? -1 : 1));
const actual = informes[informes.length - 1];
const previo = informes[informes.length - 2];
const cuenta = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const altos = top.filter((x) => x.riesgoF === 'alto').length;
const porCanal = Object.entries(cuenta(top, (x) => canal(x.canal))).sort((a, b) => b[1] - a[1]);
const n1 = top[0];
const sube = [...top, ...resto].filter((x) => x.delta > 0).sort((a, b) => b.delta - a.delta);
const prevTop = previo && previo.top && previo.top[0];

const titular = `${nombre(n1.nombre)} encabeza el ranking de estafas de ${mes} en la Argentina, con un índice de actividad de ${n1.act} sobre 100`;
const desc = `Informe del Observatorio de Fraude Digital (${mes}): ${nombre(n1.nombre).toLowerCase()} lidera con ${n1.act}/100 y ${altos} de las 10 estafas del Top 10 son de riesgo alto.`;
const url = `${SITIO}/informe-fraude-digital`;
const actualizado = d.meta.actualizado;

const filas = top.map((x) => `<tr><td>${x.pos}</td><td><a href="/observatorio/${slugDe(x.key)}">${esc(nombre(x.nombre))}</a></td><td>${x.act}</td><td>${esc(x.riesgoF)}</td><td>${esc(canal(x.canal))}</td><td>${esc(x.fuente || '')}</td></tr>`).join('');
const datos = [
    `<li><b>${esc(nombre(n1.nombre))}</b> es la estafa de mayor circulación de ${esc(mes)}: índice <b>${n1.act}/100</b>, riesgo <b>${esc(n1.riesgoF)}</b>, canal principal ${esc(canal(n1.canal))}.${prevTop ? ` En ${esc(previo.mes)} el primer puesto fue ${esc(nombre(prevTop.nombre))} (${prevTop.act}/100).` : ''}</li>`,
    `<li><b>${altos} de las 10</b> modalidades del Top 10 son de <b>riesgo alto</b> (toma de control de cuentas o del dispositivo, vaciamiento o robo de identidad).</li>`,
    `<li>Canales del Top 10: ${porCanal.map(([c, n]) => `${esc(c)} (${n})`).join(', ')}.</li>`,
    sube.length ? `<li>Las que más subieron respecto del período anterior: ${sube.slice(0, 3).map((x) => `${esc(nombre(x.nombre))} (+${x.delta})`).join(', ')}.</li>` : ''
].join('');

const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const jsonld = [
    { '@context': 'https://schema.org', '@type': 'Report', name: `Observatorio de Fraude Digital: informe de ${mes}`, headline: titular, description: desc, url, inLanguage: 'es-AR', dateModified: actualizado, datePublished: actualizado, author: { '@type': 'Organization', name: 'Cyber Mobile', url: SITIO + '/' }, publisher: { '@type': 'Organization', name: 'Cyber Mobile', url: SITIO + '/', logo: SITIO + '/Escudo%20CM.jpeg' }, isBasedOn: `${SITIO}/observatorio` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO + '/' }, { '@type': 'ListItem', position: 2, name: 'Observatorio', item: SITIO + '/observatorio' }, { '@type': 'ListItem', position: 3, name: `Informe de ${mes}`, item: url }] }
];

const CSS = `@font-face{font-family:'Space Grotesk';src:url(/observatorio/fuentes/SpaceGrotesk.ttf) format('truetype');font-weight:300 700;font-display:swap}
:root{--bg:#05070D;--line:rgba(148,163,184,.2);--txt:#E6EDF7;--txt2:#C3CEDD;--muted:#9AA8BD;--acc:#22D3EE;--ink:#04121A;--pad:clamp(16px,5vw,32px)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font-family:'Space Grotesk',system-ui,sans-serif;line-height:1.65}
a{color:var(--acc)}.wrap{max-width:860px;margin:0 auto;padding:0 var(--pad)}
header{border-bottom:1px solid var(--line)}header .wrap{height:64px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:.14em;color:var(--txt);text-decoration:none}.brand img{width:34px;height:34px;border-radius:9px}
.kick{font-size:12px;letter-spacing:.2em;color:var(--acc);text-transform:uppercase;margin-top:32px}
h1{font-size:clamp(28px,4.4vw,44px);line-height:1.12;margin:10px 0 12px}h2{font-size:24px;margin:36px 0 12px}
.meta{font-size:14px;color:var(--muted)}p,li{font-size:17.5px;color:var(--txt2)}li{margin-bottom:8px}strong,b{color:var(--txt)}
.res{padding:22px 24px;border-radius:18px;border:1px solid rgba(34,211,238,.35);background:rgba(34,211,238,.07);margin-top:22px}
.tw{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:620px;font-size:15px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}th{color:var(--muted);font-weight:600}
.cita{border-left:3px solid var(--acc);padding:4px 18px;margin:18px 0}
.btn{display:inline-block;margin-top:14px;padding:13px 22px;border-radius:14px;background:var(--acc);color:var(--ink);font-weight:600;text-decoration:none}
footer{margin:60px 0 28px;font-size:14px;color:var(--muted)}`;

const html = `<!DOCTYPE html>
<html lang="es-AR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe de estafas en Argentina: ${esc(mes)} | Observatorio</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
<meta name="theme-color" content="#05070D">
<meta property="og:type" content="article"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Cyber Mobile">
<meta property="og:title" content="${esc(titular)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITIO}/Escudo%20CM.jpeg"><meta name="twitter:card" content="summary_large_image">
${jsonld.map(ld).join('\n')}
<style>${CSS}</style>
</head><body>
<header><div class="wrap"><a class="brand" href="/"><img src="/logo-cm.png" alt="" width="34" height="34">CYBER MOBILE</a><a href="/observatorio">Observatorio</a></div></header>
<main><div class="wrap">
<div class="kick">Observatorio de Fraude Digital · Informe de ${esc(mes)}</div>
<h1>${esc(titular)}</h1>
<p class="meta">Datos al ${esc(fechaLarga(actualizado))} · Cyber Mobile · Citá este informe con el link: ${url}</p>
<div class="res"><p><b>DATO DE TITULAR.</b> ${esc(nombre(n1.nombre))} es la estafa de mayor circulación del país en ${esc(mes)}, con un índice de actividad de ${n1.act} sobre 100 y riesgo ${esc(n1.riesgoF)}. ${altos} de las 10 modalidades del Top 10 son de riesgo alto.</p></div>
<h2>Datos citables</h2><ul>${datos}</ul>
<h2>Top 10 de ${esc(mes)}</h2>
<div class="tw"><table><thead><tr><th>#</th><th>Modalidad</th><th>Índice (0-100)</th><th>Riesgo</th><th>Canal</th><th>Fuente del caso</th></tr></thead><tbody>${filas}</tbody></table></div>
<p class="meta">Cada modalidad tiene su ficha con cómo opera, cómo reconocerla y las notas de prensa de origen en el <a href="/observatorio">Observatorio</a>.</p>
<h2>Metodología</h2>
<ul>
<li><b>Qué mide el índice (0 a 100):</b> cuánto circula una modalidad según las noticias y alertas públicas del país que releva el Observatorio. No mide cantidad de víctimas ni montos.</li>
<li><b>Qué mide el riesgo (alto, medio, bajo):</b> la gravedad del daño para quien cae, según una regla fija y pública. Alto: toma de control de cuentas o del dispositivo, vaciamiento, robo de identidad o extorsión. Medio: pérdida acotada a una compra, seña o pago. Bajo: daño menor.</li>
<li><b>Fuentes:</b> medios de comunicación y organismos oficiales de la Argentina, citados en cada ficha. El ranking se actualiza de forma periódica; este informe refleja el estado al ${esc(fechaLarga(actualizado))}.</li>
<li><b>Cómo citar:</b> "Observatorio de Fraude Digital, Cyber Mobile, ${esc(mes)}" con el link ${url}.</li>
</ul>
<h2>Sobre Cyber Mobile y Vera</h2>
<p>Cyber Mobile es una empresa argentina de ciberseguridad. Desarrolla Vera, un asistente de inteligencia artificial antiestafas que funciona por WhatsApp: la persona le reenvía un mensaje, un link, un número, una captura o un audio sospechoso y Vera responde con un semáforo y qué hacer. Prensa: info@cybermobile.com.ar</p>
<a class="btn" href="/vera?o=prensa" rel="nofollow">Probá Vera gratis por 7 días</a>
<footer>© Cyber Mobile · <a href="/observatorio">Observatorio de Fraude Digital</a> · <a href="/guias">Guías</a></footer>
</div></main></body></html>
`;
fs.mkdirSync(path.join(RAIZ, 'informe-fraude-digital'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'informe-fraude-digital', 'index.html'), html);
console.log('OK informe-fraude-digital/index.html');
