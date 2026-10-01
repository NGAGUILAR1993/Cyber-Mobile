// Página propia de cada estafa del Observatorio: /observatorio/<slug>
// Se genera en el servidor a partir de observatorio/datos.json para que los
// buscadores reciban el contenido completo, sin depender de JavaScript.
import { cargarDatos, modalidades, slugDe, canal, conTildes, esc, SITIO } from './_lib/observatorio.js';

const WA = 'https://wa.me/5491170598505?text=';
const RIESGO = { alto: 'Riesgo alto', medio: 'Riesgo medio', bajo: 'Riesgo bajo' };

function pasos(c) {
    const k = String(c || '').toUpperCase();
    const p1 = {
        WHATSAPP: ['No respondas ni abras el link.', 'Tampoco compartas códigos que te lleguen por SMS.'],
        REDES: ['No hagas clic ni transfieras dinero.', 'Desconfiá de premios, ganancias u ofertas que llegan por mensaje privado.'],
        TELEFONO: ['Cortá la llamada.', 'Nunca instales apps ni compartas pantalla porque te lo pide alguien por teléfono.'],
        'TELÉFONO': ['Cortá la llamada.', 'Nunca instales apps ni compartas pantalla porque te lo pide alguien por teléfono.'],
        SMS: ['No abras el link del mensaje.', 'Los organismos y bancos no piden datos por SMS.']
    }[k] || ['No respondas ni abras links.', 'Ante la duda, no avances.'];
    const p2 = {
        WHATSAPP: ['Bloqueá y reportá', 'el número desde WhatsApp.'],
        REDES: ['Reportá el perfil', 'o la publicación en la red social.'],
        SMS: ['Bloqueá el número', 'y borrá el mensaje.']
    }[k] || ['Bloqueá el número', 'o el contacto.'];
    return [
        p1,
        p2,
        ['Si ya diste datos o transferiste,', 'comunicate con tu banco o billetera por sus canales oficiales y cambiá tus claves.'],
        ['Hacé la denuncia y avisá a tu familia,', 'sobre todo a las personas mayores.']
    ];
}

function recortar(t, n) {
    const s = String(t || '').replace(/\s+/g, ' ').trim();
    if (s.length <= n) return s;
    return s.slice(0, s.lastIndexOf(' ', n - 1)) + '…';
}

function fechaCorta(iso) {
    const f = new Date(iso);
    if (isNaN(f)) return '';
    const p = (n) => String(n).padStart(2, '0');
    return p(f.getUTCDate()) + '.' + p(f.getUTCMonth() + 1) + '.' + f.getUTCFullYear();
}

const ICON = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
};
const svg = (n, s = 20) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

const CSS = `
:root{--bg:#05070D;--surface:#0A0F1C;--line:rgba(148,163,184,.14);--line2:rgba(148,163,184,.28);--txt:#E6EDF7;--txt2:#C3CEDD;--muted:#9AA8BD;--acc:#22D3EE;--ink:#04121A;--alto:#FB923C;--medio:#FACC15;--bajo:#60A5FA;--pad:clamp(16px,5.5vw,80px)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}
body{margin:0;background:var(--bg);color:var(--txt);font-family:'Space Grotesk',system-ui,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:var(--acc);text-decoration:none}a:hover{color:#67E8F9}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:6px}
.i{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.wrap{max-width:1280px;margin:0 auto;padding:0 var(--pad);position:relative}
.top{position:sticky;top:0;z-index:50;background:rgba(5,7,13,.8);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(148,163,184,.1)}
.top .wrap{height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.brand{display:flex;align-items:center;gap:12px;color:var(--txt)}.brand:hover{color:var(--txt)}
.brand .i{width:28px;height:28px;color:var(--acc);stroke-width:1.8}
.brand b{font-family:Orbitron,sans-serif;font-size:16px;letter-spacing:.14em}
.menu{display:flex;gap:28px;font-size:15px;font-weight:500}.menu a{color:var(--muted)}.menu a:hover{color:var(--txt)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 22px;border-radius:14px;font-weight:600;font-size:16px}
.btn-p{background:var(--acc);color:var(--ink)}.btn-p:hover{color:var(--ink);opacity:.92}
.btn-g{border:1px solid var(--line2);color:var(--txt);font-weight:500}.btn-g:hover{color:var(--txt);border-color:var(--acc)}
.pill{min-height:44px;border-radius:999px;padding:10px 20px;font-size:15px}
.glow{position:absolute;top:-300px;right:-200px;width:900px;height:700px;border-radius:50%;background:radial-gradient(closest-side,rgba(34,211,238,.12),transparent);pointer-events:none;z-index:-1}
main{overflow-x:clip}
.hero{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:48px;align-items:end;padding:44px 0 0}
.crumbs{display:flex;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--muted);margin:0 0 18px;padding:0;list-style:none}
.crumbs a{color:var(--muted)}.crumbs a:hover{color:var(--txt)}.crumbs li+li::before{content:'›';margin-right:8px}
.kick{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.2em;color:var(--acc);text-transform:uppercase}
h1{font-size:clamp(32px,4.6vw,56px);line-height:1.06;font-weight:700;letter-spacing:-.025em;margin:14px 0 18px}
.meta{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:15px;color:var(--muted)}
.chip{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:6px 11px;border-radius:999px;border:1px solid var(--line2);color:var(--txt2)}
.rg{font-size:13px;font-weight:600;padding:6px 12px;border-radius:999px}
.rg.alto{background:rgba(251,146,60,.14);color:var(--alto)}.rg.medio{background:rgba(250,204,21,.12);color:var(--medio)}.rg.bajo{background:rgba(96,165,250,.14);color:var(--bajo)}
.tile{background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01));border:1px solid var(--line);border-radius:20px}
.idx{padding:24px;display:flex;flex-direction:column;gap:10px}
.idx .n{font-family:'JetBrains Mono',monospace;font-size:52px;line-height:1}
.idx .d{font-family:'JetBrains Mono',monospace;font-size:15px;margin-left:10px}
.meter{height:8px;border-radius:999px;background:rgba(148,163,184,.14);overflow:hidden}.meter i{display:block;height:100%;border-radius:999px}
.idx small{font-size:13px;color:#8391A7;line-height:1.5}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:48px;align-items:start;padding-top:44px}
article{display:flex;flex-direction:column;gap:48px;min-width:0}
h2{font-size:clamp(23px,2.4vw,28px);font-weight:700;letter-spacing:-.015em;margin:0 0 14px}
.p{margin:0;font-size:17.5px;line-height:1.7;color:var(--txt2)}
.sum{padding:28px 30px;border-radius:20px;border:1px solid rgba(34,211,238,.35);background:linear-gradient(120deg,rgba(34,211,238,.09),rgba(10,15,28,.4) 70%)}
.sum ul{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:14px}
.sum li{display:flex;gap:14px;font-size:18px;line-height:1.55}.sum li .i{color:var(--acc);margin-top:4px;stroke-width:2.4}
.steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.step{padding:20px;display:flex;gap:14px;font-size:16px;line-height:1.55;color:var(--txt2)}
.step b{color:var(--txt)}
.num{width:36px;height:36px;border-radius:10px;border:1px solid rgba(34,211,238,.3);background:rgba(34,211,238,.08);color:var(--acc);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:14px;flex-shrink:0}
.duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.box{padding:22px 24px;display:flex;flex-direction:column;gap:12px}
.lbl{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;color:var(--muted)}
.chips{display:flex;gap:8px;flex-wrap:wrap}.chips span{padding:7px 13px;border-radius:999px;background:rgba(96,165,250,.12);color:#93C5FD;font-size:14px}
.src{display:flex;flex-direction:column;gap:8px;font-size:15px}
.src .ag{color:#A5F3FC}
details{border-radius:20px}
details+details{margin-top:10px}
summary{list-style:none;cursor:pointer;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:18px;font-weight:600}
summary::-webkit-details-marker{display:none}
summary .i{color:var(--muted);transition:transform .25s}
details[open]{border-color:rgba(34,211,238,.35)}details[open] summary .i{transform:rotate(180deg);color:var(--acc)}
details p{margin:0;padding:0 24px 22px;font-size:16px;line-height:1.65;color:var(--txt2)}
aside{display:flex;flex-direction:column;gap:14px;position:sticky;top:96px}
.cta{padding:26px;border-radius:22px;background:radial-gradient(120% 100% at 100% 0%,rgba(34,211,238,.2),rgba(10,15,28,.9) 70%);border:1px solid rgba(34,211,238,.35);display:flex;flex-direction:column;gap:14px}
.cta b{font-size:22px;line-height:1.25}.cta span{font-size:15.5px;line-height:1.55;color:var(--txt2)}
.toc{padding:20px 22px;display:flex;flex-direction:column}
.toc a{color:var(--txt2);font-size:15px;padding:7px 0}.toc a:hover{color:var(--acc)}
.rel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.rel a{padding:22px;display:flex;flex-direction:column;gap:12px;color:var(--txt);transition:border-color .2s,transform .2s}
.rel a:hover{border-color:rgba(34,211,238,.4);transform:translateY(-3px);color:var(--txt)}
.rel .h{display:flex;justify-content:space-between;align-items:center}
.rel .pos{font-family:'JetBrains Mono',monospace;font-size:26px;color:var(--acc)}
.rel b{font-size:18px;line-height:1.3}
.cta-m{display:none}
.note{font-size:14px;color:#8391A7;line-height:1.6}
footer{margin-top:72px;border-top:1px solid rgba(148,163,184,.1)}
footer .wrap{padding-top:28px;padding-bottom:28px;display:flex;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;font-size:14px;color:#8391A7}
@media(max-width:980px){.cta-m{display:flex;margin-top:-24px}.hero,.layout{grid-template-columns:1fr}aside{position:static}.menu{display:none}.rel{grid-template-columns:1fr}}
@media(max-width:640px){.top .wrap{height:64px}.brand b{font-size:13px}.top .pill span{display:none}.top .pill{width:44px;padding:0}.steps,.duo{grid-template-columns:1fr}.sum{padding:20px}.sum li{font-size:16px}.idx .n{font-size:40px}.toc{display:none}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
`;

function cabecera() {
    return `<header class="top"><div class="wrap">
<a class="brand" href="/" aria-label="Cyber Mobile, inicio">${svg('shield', 28)}<b>CYBER MOBILE</b></a>
<nav class="menu" aria-label="Sitio"><a href="/#herramientas">Herramientas</a><a href="/#simulador">Simulador</a><a href="/observatorio">Observatorio</a><a href="/#contacto">Contacto</a></nav>
<a class="btn btn-p pill" href="${WA}${encodeURIComponent('Hola, quiero probar Cyber Mobile')}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp">${svg('chat', 18)}<span>Consultar por WhatsApp</span></a>
</div></header>`;
}

function documento({ title, description, canonical, jsonld, body, status }) {
    return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '<meta name="robots" content="noindex">'}
<meta name="theme-color" content="#05070D">
<meta property="og:type" content="article"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Cyber Mobile">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta property="og:image" content="${SITIO}/Escudo%20CM.jpeg"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
<style>${CSS}</style>
</head><body>
${cabecera()}
<main id="contenido">${body}</main>
<footer><div class="wrap"><span>Observatorio de Fraude Digital · Dirección: Mg. Norberto Germán Aguilar</span><span>© ${new Date().getFullYear()} Cyber Mobile</span></div></footer>
</body></html>`;
}

function noEncontrada(res) {
    const body = `<div class="wrap" style="padding:96px 0 40px;max-width:760px">
<div class="kick">Observatorio de Fraude Digital</div>
<h1>Esta estafa no está en el ranking actual</h1>
<p class="p">Puede que haya dejado de circular con fuerza este mes. Mirá el ranking actualizado o consultanos si te llegó algo sospechoso.</p>
<p style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px"><a class="btn btn-p" href="/observatorio">Ver el Observatorio</a><a class="btn btn-g" href="${WA}${encodeURIComponent('Hola, quiero probar Cyber Mobile')}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></p>
</div>`;
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=600');
    res.end(documento({ title: 'Estafa no encontrada · Observatorio de Fraude Digital', description: 'Esta modalidad no figura en el ranking actual del Observatorio de Fraude Digital de Cyber Mobile.', body }));
}

export default function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return res.status(405).end();
    }
    const slug = String((req.query && req.query.slug) || '').toLowerCase();
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) return noEncontrada(res);

    let d;
    try { d = cargarDatos(); } catch (e) {
        console.error('estafa.js: no se pudo leer datos.json', e.message);
        return res.status(503).send('Observatorio no disponible');
    }
    const lista = modalidades(d);
    const s = lista.find((x) => x.slug === slug);
    if (!s) return noEncontrada(res);

    const mes = (d.meta && d.meta.mes) || '';
    const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);
    const c = canal(s.canal);
    const nombre = conTildes(s.nombre);
    const titulo = `${nombre}${c.frase ? ' ' + c.frase : ''}: cómo reconocerla`;
    const url = `${SITIO}/observatorio/${slug}`;
    const act = Math.max(0, Math.min(100, Number(s.act) || 0));
    const riesgo = RIESGO[s.riesgo] ? s.riesgo : 'medio';
    const colR = { alto: 'var(--alto)', medio: 'var(--medio)', bajo: 'var(--bajo)' }[riesgo];
    const delta = Number(s.delta) || 0;
    const actualizado = (d.meta && d.meta.actualizado) || '';
    const lugar = s.seccion === 'top' ? `#${s.pos} del ranking · ${mes}` : `En vigilancia · ${mes}`;
    const como = conTildes(s.como), detectar = conTildes(s.detectar);

    const provincias = (s.provincias || []).map((p) => (typeof p === 'string' ? p : p && p.nombre)).filter(Boolean);
    const evid = (Array.isArray(s.evidencias) && s.evidencias.length ? s.evidencias : (s.url ? [{ url: s.url, medio: s.fuente }] : []))
        .filter((e, i, arr) => arr.findIndex((o) => o.medio === e.medio) === i).slice(0, 3);
    const fuentes = evid.map((e, i) => /cyber\s*mobile/i.test(e.medio || '')
        ? `<span class="ag">${i + 1} · Reportes de usuarios del agente Cyber Mobile</span>`
        : `<a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer nofollow">${i + 1} · ${esc(e.medio || 'Fuente')}</a>`).join('');

    const relacionadas = (d.top10 || []).map((x) => ({ ...x, slug: slugDe(x.key) }))
        .filter((x) => x.slug && x.slug !== slug)
        .sort((a, b) => (canal(b.canal).lbl === c.lbl) - (canal(a.canal).lbl === c.lbl) || a.pos - b.pos)
        .slice(0, 3);

    const compartir = `Alerta de estafa: ${nombre}.\n\nCómo reconocerla: ${detectar}\n\nMás info: ${url}`;
    const consultar = `Hola, me llegó algo que parece "${nombre}". ¿Me ayudan a verificarlo?`;
    const ps = pasos(s.canal);

    const body = `<div class="wrap"><div class="glow"></div>
<section class="hero">
 <div>
  <ol class="crumbs" aria-label="Ruta"><li><a href="/">Inicio</a></li><li><a href="/observatorio">Observatorio</a></li><li aria-current="page">${esc(nombre)}</li></ol>
  <div class="kick">${esc(lugar)}</div>
  <h1>${esc(titulo)}</h1>
  <div class="meta"><span class="chip">${esc(c.lbl)}</span><span class="rg ${riesgo}">${RIESGO[riesgo]}</span>${actualizado ? `<span>Actualizado el ${fechaCorta(actualizado)}</span>` : ''}</div>
 </div>
 <div class="tile idx">
  <span style="font-size:14px;color:var(--muted)">Índice de actividad</span>
  <div><span class="n">${act}</span>${delta ? `<span class="d" style="color:${delta > 0 ? 'var(--alto)' : 'var(--bajo)'}">${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}</span>` : ''}</div>
  <div class="meter"><i style="width:${act}%;background:${colR}"></i></div>
  <small>Mide cuánto circula en alertas y publicaciones, de 0 a 100. No mide cantidad de casos.</small>
 </div>
</section>

<div class="layout">
<article>
 <section class="sum" aria-labelledby="resumen">
  <h2 class="kick" id="resumen" style="margin:0;font-size:12px;letter-spacing:.2em">Cómo reconocerla en 10 segundos</h2>
  <ul>
   <li>${svg('check', 22)}<span><b>${esc(detectar)}</b></span></li>
   <li>${svg('check', 22)}<span>Llega ${esc(c.frase || 'por mensaje')}. Si no lo esperabas, desconfiá.</span></li>
   <li>${svg('check', 22)}<span>Ante la duda, no respondas: reenvialo a Cyber Mobile y lo verificamos.</span></li>
  </ul>
 </section>

 <a class="btn btn-p cta-m" href="${WA}${encodeURIComponent(consultar)}" target="_blank" rel="noopener noreferrer">${svg('chat', 18)}¿Te llegó? Verificalo por WhatsApp</a>

 <section id="como-opera"><h2>Cómo opera</h2><p class="p">${esc(como)}</p></section>

 <section id="que-hacer"><h2>Qué hacer si te llegó</h2>
  <div class="steps">${ps.map((x, i) => `<div class="tile step"><span class="num">${i + 1}</span><span><b>${esc(x[0])}</b> ${esc(x[1])}</span></div>`).join('')}</div>
 </section>

 <div class="duo">
  <div class="tile box"><span class="lbl">DÓNDE SE REPORTÓ</span><div class="chips">${provincias.length ? provincias.map((p) => `<span>${esc(p)}</span>`).join('') : '<span>Argentina</span>'}</div></div>
  <div class="tile box"><span class="lbl">FUENTES</span><div class="src">${fuentes || '<span class="note">Sin fuentes publicadas.</span>'}</div></div>
 </div>

 <section id="preguntas"><h2>Preguntas frecuentes</h2>
  <details class="tile" open><summary>¿Qué hago si ya caí?${svg('chev', 18)}</summary><p>Comunicate cuanto antes con tu banco o billetera virtual por sus canales oficiales, cambiá tus claves y hacé la denuncia. Avisá a tus contactos para que no caigan con el mismo mensaje.</p></details>
  <details class="tile"><summary>¿Cómo verifico si un mensaje es real?${svg('chev', 18)}</summary><p>Contactá a la entidad por sus canales oficiales, nunca por el número o el link que te mandaron. También podés reenviar el mensaje a Cyber Mobile por WhatsApp y te decimos si es seguro.</p></details>
  <details class="tile"><summary>¿Qué mide el índice de actividad?${svg('chev', 18)}</summary><p>Indica, de 0 a 100, cuánto está circulando esta estafa en alertas oficiales, medios y consultas anónimas al agente durante ${esc(mes)}. Pondera cuántas fuentes independientes la reportan y la autoridad de cada una. No mide cantidad de víctimas.</p></details>
 </section>

 <p class="note">Fuente: Observatorio de Fraude Digital de Cyber Mobile, edición ${esc(mes)}. El índice refleja la circulación en fuentes públicas y en consultas anónimas al agente.</p>
</article>

<aside>
 <div class="cta">
  <b>¿Te llegó un mensaje así?</b>
  <span>Reenvialo a Cyber Mobile y te decimos si es la misma estafa. 7 días de prueba gratuita.</span>
  <a class="btn btn-p" href="${WA}${encodeURIComponent(consultar)}" target="_blank" rel="noopener noreferrer">${svg('chat', 18)}Verificar por WhatsApp</a>
 </div>
 <a class="btn btn-g" href="https://wa.me/?text=${encodeURIComponent(compartir)}" target="_blank" rel="noopener noreferrer">${svg('share', 16)}Avisar a mi familia</a>
 <nav class="tile toc" aria-label="En esta página"><span class="lbl" style="margin-bottom:6px">EN ESTA PÁGINA</span><a href="#resumen">Cómo reconocerla</a><a href="#como-opera">Cómo opera</a><a href="#que-hacer">Qué hacer si te llegó</a><a href="#preguntas">Preguntas frecuentes</a></nav>
</aside>
</div>

${relacionadas.length ? `<section style="padding-top:72px"><h2>Otras estafas que circulan en ${esc(mes)}</h2>
<div class="rel">${relacionadas.map((x) => `<a class="tile" href="/observatorio/${x.slug}"><span class="h"><span class="pos">${String(x.pos).padStart(2, '0')}</span><span class="chip">${esc(canal(x.canal).lbl)}</span></span><b>${esc(conTildes(x.nombre))}</b></a>`).join('')}</div>
<p style="margin-top:20px"><a href="/observatorio" style="display:inline-flex;align-items:center;gap:8px;font-weight:600;min-height:44px">Ver el ranking completo de ${esc(mes)} ${svg('arrow', 18)}</a></p>
</section>` : ''}
</div>`;

    const jsonld = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                headline: titulo,
                description: recortar(detectar, 300),
                inLanguage: 'es-AR',
                dateModified: actualizado || undefined,
                mainEntityOfPage: url,
                image: `${SITIO}/Escudo%20CM.jpeg`,
                author: { '@type': 'Person', name: 'Norberto Germán Aguilar' },
                publisher: { '@type': 'Organization', name: 'Cyber Mobile', url: SITIO, logo: { '@type': 'ImageObject', url: `${SITIO}/Escudo%20CM.jpeg` } },
                isPartOf: { '@type': 'WebPage', name: 'Observatorio de Fraude Digital', url: `${SITIO}/observatorio` }
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
                    { '@type': 'ListItem', position: 2, name: 'Observatorio', item: `${SITIO}/observatorio` },
                    { '@type': 'ListItem', position: 3, name: nombre, item: url }
                ]
            }
        ]
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.end(documento({
        title: `${titulo} (${mesCap.replace(' de ', ' ')}) | Cyber Mobile`,
        description: recortar(`${detectar} Cómo opera, señales y qué hacer si te llegó.`, 158),
        canonical: url,
        jsonld,
        body
    }));
}
