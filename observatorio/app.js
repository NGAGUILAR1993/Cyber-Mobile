const TH = {
  oscuro: {
    bg: '#05070D', surface: '#0A0F1C', panel: '#0B1120', line: '#1E2636', line2: '#161D2B',
    txt: '#E6EDF7', txt2: '#C3CEDD', txt3: '#9AA8BD',
    acc: '#22D3EE', acc2: '#22D3EE', accInk: '#04121A', oro: '#FACC15',
    alto: '#FB923C', medio: '#FACC15', bajo: '#60A5FA',
    chipBg: 'rgba(34,211,238,.08)', chipBd: 'rgba(34,211,238,.3)', emergBg: 'rgba(250,204,21,.1)', emergBd: 'rgba(250,204,21,.35)', emergTx: '#FACC15',
    agBg: 'rgba(34,211,238,.1)', agBd: 'rgba(34,211,238,.4)', agTx: '#A5F3FC',
    verde: '#34D399', track: '#151C2A', ico: '#9AA8BD', glow: 'rgba(34,211,238,.14)'
  },
  claro: {
    bg: '#F6F8FB', surface: '#FFFFFF', panel: '#FFFFFF', line: '#D9E0EA', line2: '#E6EBF2',
    txt: '#0B1220', txt2: '#334155', txt3: '#5B6B80',
    acc: '#0E7490', acc2: '#0891B2', accInk: '#FFFFFF', oro: '#B45309',
    alto: '#C2410C', medio: '#A16207', bajo: '#1D4ED8',
    chipBg: '#ECFEFF', chipBd: '#A5F3FC', emergBg: '#FEF9C3', emergBd: '#FDE047', emergTx: '#854D0E',
    agBg: '#ECFEFF', agBd: '#67E8F9', agTx: '#155E75',
    verde: '#047857', track: '#E6EBF2', ico: '#5B6B80', glow: 'rgba(8,145,178,.10)'
  }
};
let modo = 'oscuro';
try { modo = localStorage.getItem('cm_modo') === 'claro' ? 'claro' : 'oscuro'; } catch (e) {}
let D = null;

function C() { return TH[modo]; }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function riesgoCol(r) { const c = C(); return r === 'alto' ? c.alto : r === 'medio' ? c.medio : c.bajo; }
const RL = { alto: 'RIESGO ALTO', medio: 'RIESGO MEDIO', bajo: 'RIESGO BAJO' };

function aplicarModo() {
  const c = C(), r = document.documentElement.style;
  Object.keys(c).forEach(k => r.setProperty('--' + k, c[k]));
  document.documentElement.style.background = c.bg;
  if (document.body) document.body.style.background = c.bg;
  const b = document.getElementById('modoLbl');
  if (b) b.textContent = modo === 'claro' ? 'Modo oscuro' : 'Modo claro';
  if (D) render();
}
function toggleModo() {
  modo = modo === 'claro' ? 'oscuro' : 'claro';
  try { localStorage.setItem('cm_modo', modo); } catch (e) {}
  aplicarModo();
}

function ilustracion(canal, riesgo) {
  const col = riesgoCol(riesgo), c = C();
  const badge = '<circle cx="52" cy="16" r="9" fill="' + col + '"/><path d="M52 12v4.5M52 19.5v.5" stroke="' + c.bg + '" stroke-width="1.8" stroke-linecap="round"/>';
  const M = {
    MAIL: '<rect x="8" y="18" width="48" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 20l23 17 23-17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' + badge,
    WHATSAPP: '<path d="M32 9a23 23 0 00-19.8 34.7L9 56l12.9-3A23 23 0 1032 9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 25c-1.3 0-2.6.7-2.6 2.6 0 6.6 6.6 13.2 13.2 13.2 1.9 0 2.6-1.3 2.6-2.6s-2.6-2.6-4-2.6-1.9 1.3-2.6 1.3-5.3-4-5.3-5.3 1.3-1.3 1.3-2.6-1.3-4-2.6-4z" fill="currentColor"/>' + badge,
    SMS: '<rect x="7" y="16" width="46" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M17 46l-3 9 11-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="31" r="2.4" fill="currentColor"/><circle cx="30" cy="31" r="2.4" fill="currentColor"/><circle cx="40" cy="31" r="2.4" fill="currentColor"/>' + badge,
    REDES: '<circle cx="32" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="14" cy="46" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="50" cy="46" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M26 20L18 39M38 20l8 19M21 46h22" stroke="currentColor" stroke-width="1.6"/><circle cx="50" cy="46" r="6" fill="' + col + '"/>',
    'TEL\u00c9FONO': '<path d="M18 8c3 0 4.5 1.5 6 6l3 7.5-4.5 4.5c1.5 6 7.5 12 13.5 13.5l4.5-4.5 7.5 3c4.5 1.5 6 3 6 6 0 6-4.5 9-10.5 9C28 53 11 36 11 17.5 11 11.5 14 8 18 8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' + badge,
    MARKETPLACE: '<path d="M9 20h46l-4.2 28a4 4 0 01-4 3H17.2a4 4 0 01-4-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M22 20a10 10 0 0120 0" fill="none" stroke="currentColor" stroke-width="1.6"/>' + badge,
    APP: '<rect x="17" y="7" width="30" height="50" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="32" cy="50" r="2.4" fill="currentColor"/><path d="M25 27l5.5 5.5L42 21" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  return '<svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true" style="color:' + c.ico + ';display:block;margin:0 auto">' + (M[canal] || M.REDES) + '</svg>';
}

function esAgente(m) { return /cyber\s*mobile/i.test(String(m || '')); }


var PAISES = {AR:'Argentina',ES:'Espa\u00f1a',MX:'M\u00e9xico',CL:'Chile',CO:'Colombia',PE:'Per\u00fa',
 UY:'Uruguay',BR:'Brasil',US:'Estados Unidos',GB:'Reino Unido',EU:'Uni\u00f3n Europea'};

// Normaliza el pais venga como codigo ('ES') o como nombre ('Espana' / 'Exterior')
function nombrePais(v){
  var s = String(v || '').trim();
  if (!s) return '';
  if (PAISES[s.toUpperCase()]) return PAISES[s.toUpperCase()];
  if (/^(exterior|internacional|xx|int)$/i.test(s)) return '';
  return s;
}

// esIntl se decide por la SECCION que se esta renderizando, no por un campo del flujo.
function origenHTML(s, esIntl){
  var lugar;
  if (esIntl) {
    var p = nombrePais(s.origen || s.pais);
    if (/^argentina$/i.test(p)) p = '';
    lugar = p ? esc(p) : 'Exterior';
  } else {
    lugar = 'Argentina';
    if (s.provincias && s.provincias.length) lugar += ' \u00b7 ' + esc(s.provincias[0].nombre);
  }
  return '<div class="orig"><span class="olbl">ORIGEN</span><span class="oval">' + lugar + '</span></div>';
}

function fuentesHTML(item) {
  const c = C();
  const evs = Array.isArray(item.evidencias) && item.evidencias.length
    ? item.evidencias.slice(0, 3)
    : (item.url ? [{ url: item.url, medio: item.fuente || 'Fuente' }] : []);
  if (!evs.length) {
    return '<div class="fu"><span class="flbl">FUENTES</span><span class="sinf">sin respaldo publicado</span></div>';
  }
  const html = evs.map(function (e, i) {
    if (esAgente(e.medio)) {
      return '<span class="fag"><svg viewBox="0 0 24 28" width="12" height="14" aria-hidden="true">' +
        '<path d="M12 1 L23 5 V14 C23 20 18 24 12 27 C6 24 1 20 1 14 V5 Z" fill="' + c.acc2 + '"/>' +
        '<circle cx="12" cy="12" r="3.4" fill="none" stroke="' + c.bg + '" stroke-width="1.3"/>' +
        '<circle cx="12" cy="12" r="1" fill="' + c.oro + '"/></svg>Cyber Mobile | Agente de Seguridad Digital</span>';
    }
    return '<a class="f" href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="fn">' + (i + 1) + '</span>' + esc(e.medio || 'Fuente') + '</a>';
  }).join('');
  return '<div class="fu"><span class="flbl">FUENTES</span>' + html + '</div>';
}

function tendencia(d) {
  if (d > 0) return '<span class="tr up">\u25b2 ' + d + '</span>';
  if (d < 0) return '<span class="tr dn">\u25bc ' + Math.abs(d) + '</span>';
  return '<span class="tr fl">sin cambio</span>';
}

var CANAL_LBL = { WHATSAPP: 'WhatsApp', REDES: 'Redes', TELEFONO: 'Teléfono', 'TELÉFONO': 'Teléfono', SMS: 'SMS', MAIL: 'Email', MARKETPLACE: 'Marketplace', APP: 'App' };
function canalLbl(k) { return CANAL_LBL[String(k || '').toUpperCase()] || String(k || ''); }
var SITIO = 'https://www.cybermobile.com.ar/observatorio';
var ABIERTA = null;   // id de la tarjeta desplegada

function idEntrada(s, esIntl) { return (esIntl ? 'i' : 'e') + s.pos; }
// Misma regla que api/_lib/observatorio.js: la clave define la URL de la ficha.
function slugDe(key) {
  return String(key || '').split('@')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function compartirHref(s, id) {
  var txt = 'Alerta de estafa: ' + s.nombre + '.\n\nCómo reconocerla: ' + (s.detectar || '') +
    '\n\nMás info en el Observatorio de Fraude Digital de Cyber Mobile: ' + SITIO + '#' + id;
  return 'https://wa.me/?text=' + encodeURIComponent(txt);
}

function entrada(s, esIntl) {
  const deAgente = Array.isArray(s.evidencias) && s.evidencias.some(function (e) { return esAgente(e.medio); });
  esIntl = !!esIntl;
  const id = idEntrada(s, esIntl);
  const abierta = ABIERTA === id;
  const act = Math.max(0, Math.min(100, Number(s.act) || 0));
  const nota = deAgente
    ? 'Reportada por usuarios del agente y contrastada con fuentes públicas.'
    : 'El índice pondera cuántas fuentes independientes la reportan y la autoridad de cada una. No mide cantidad de casos.';
  return '<article class="ent' + (abierta ? ' open' : '') + '" id="' + id + '">' +
    '<button type="button" class="ent-h" aria-expanded="' + abierta + '" aria-controls="' + id + '-b">' +
      '<span class="rk">' + ('0' + s.pos).slice(-2) + '</span>' +
      '<span class="ent-ic">' + ilustracion(s.canal, s.riesgo) + '</span>' +
      '<span class="ent-t"><span class="ent-n">' + esc(s.nombre) + '</span>' +
        '<span class="mt"><span class="ch">' + esc(canalLbl(s.canal)) + '</span>' +
        '<span class="rg" style="color:' + riesgoCol(s.riesgo) + '">' + (RL[s.riesgo] || '') + '</span>' +
        (s.emergente ? '<span class="em">EMERGENTE</span>' : '') + tendencia(s.delta) + '</span></span>' +
      '<span class="ca"><span class="al">Índice de actividad</span><span class="an">' + act + '</span>' +
        '<span class="ab"><span style="width:' + act + '%;background:' + riesgoCol(s.riesgo) + '"></span></span></span>' +
      '<span class="chev" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
    '</button>' +
    '<div class="ent-b" id="' + id + '-b"' + (abierta ? '' : ' hidden') + '>' +
      '<div class="ent-g">' +
        '<div class="box"><div class="lbl">MODUS OPERANDI</div><p>' + esc(s.como) + '</p></div>' +
        '<div class="box box-acc"><div class="lbl">CÓMO RECONOCERLA</div><p>' + esc(s.detectar) + '</p></div>' +
      '</div>' +
      origenHTML(s, esIntl) +
      fuentesHTML(s) +
      '<div class="ent-f noprint"><p class="ax">' + nota + '</p>' +
        '<span class="ent-acc">' +
        (!esIntl && slugDe(s.key) ? '<a class="ficha" href="/observatorio/' + slugDe(s.key) + '">Ver ficha completa \u2192</a>' : '') +
        '<a class="share" href="' + esc(compartirHref(s, id)) + '" target="_blank" rel="noopener noreferrer">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></g></svg>' +
        'Avisar a mi familia por WhatsApp</a></span></div>' +
    '</div>' +
  '</article>';
}

function toggleEntrada(btn) {
  var art = btn.closest('.ent');
  if (!art) return;
  var abrir = !art.classList.contains('open');
  document.querySelectorAll('.ent.open').forEach(function (o) {
    if (o === art) return;
    o.classList.remove('open');
    o.querySelector('.ent-h').setAttribute('aria-expanded', 'false');
    o.querySelector('.ent-b').hidden = true;
  });
  art.classList.toggle('open', abrir);
  btn.setAttribute('aria-expanded', String(abrir));
  art.querySelector('.ent-b').hidden = !abrir;
  ABIERTA = abrir ? art.id : null;
}

// ----- Filtros del ranking (canal + búsqueda) -----
var FILTRO = { canal: 'TODOS', q: '' };
function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function aplicaFiltro(x) {
  if (FILTRO.canal !== 'TODOS' && canalLbl(x.canal) !== FILTRO.canal) return false;
  if (FILTRO.q) {
    var h = norm(x.nombre + ' ' + x.como + ' ' + x.detectar + ' ' + canalLbl(x.canal));
    return h.indexOf(norm(FILTRO.q)) !== -1;
  }
  return true;
}
function pintarFiltros() {
  var cont = document.getElementById('filtros');
  if (!cont) return;
  var lista = rankTop();
  var canales = [];
  lista.forEach(function (x) { var l = canalLbl(x.canal); if (canales.indexOf(l) === -1) canales.push(l); });
  var opts = ['TODOS'].concat(canales);
  cont.innerHTML = opts.map(function (k) {
    var n = k === 'TODOS' ? lista.length : lista.filter(function (x) { return canalLbl(x.canal) === k; }).length;
    return '<button type="button" class="fchip" data-canal="' + esc(k) + '" aria-pressed="' + (FILTRO.canal === k) + '">' +
      (k === 'TODOS' ? 'Todos' : esc(k)) + '<span>' + n + '</span></button>';
  }).join('');
}

// ----- Resumen superior: indicadores + canales + provincias -----
function resumenHTML() {
  var k = D.kpi || {}, dist = (D.dist || []).slice().sort(function (a, b) { return b.pct - a.pct; });
  var top = dist[0];
  var tiles = [
    [k.monit, 'modalidades monitoreadas', ''],
    [k.sube, 'en alza este mes', 'up'],
    [k.intl, 'alertas internacionales', ''],
    [top ? top.pct + '%' : '—', top ? 'llegan por ' + canalLbl(top.label) : 'canal principal', '']
  ];
  var maxD = dist.reduce(function (m, d) { return Math.max(m, d.pct); }, 1);
  var provs = ((D.mapa && D.mapa.provincias) || []).slice().sort(function (a, b) { return b.casos - a.casos; }).slice(0, 5);
  var maxP = provs.reduce(function (m, p) { return Math.max(m, p.casos); }, 1);
  function barra(lbl, val, pct, cls, sufijo) {
    return '<div class="hb" title="' + esc(lbl) + ': ' + val + sufijo + '"><span class="hb-l">' + esc(lbl) + '</span>' +
      '<span class="hb-t"><i class="' + cls + '" style="width:' + pct + '%"></i></span><span class="hb-v">' + val + sufijo + '</span></div>';
  }
  return '<div class="kpis">' + tiles.map(function (t) {
      return '<div class="kt"><span class="kv' + (t[2] ? ' ' + t[2] : '') + '">' + (t[0] == null ? '—' : t[0]) + '</span><span class="kl2">' + t[1] + '</span></div>';
    }).join('') + '</div>' +
    '<div class="charts">' +
      '<figure class="chart"><figcaption><b>¿Por dónde llegan las estafas?</b><span>Peso de cada canal en el índice del mes</span></figcaption>' +
        dist.map(function (d) { return barra(canalLbl(d.label), d.pct, d.pct / maxD * 100, 'c1', '%'); }).join('') + '</figure>' +
      (provs.length ? '<figure class="chart"><figcaption><b>Provincias con más casos reportados</b><span>Casos geolocalizados en el período</span></figcaption>' +
        provs.map(function (p) { return barra(p.nombre, p.casos, p.casos / maxP * 100, 'c2', ''); }).join('') + '</figure>' : '') +
    '</div>';
}

function svgBarras() {
  const c = C();
  const items = D.top10.slice().sort(function (a, b) { return b.act - a.act; });
  const max = Math.max.apply(null, items.map(function (i) { return i.act; })) || 100;
  const rowH = 32, gap = 7, w = 640, barX = 302, barMax = w - barX - 48;
  const h = items.length * (rowH + gap);
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + w + 'px;display:block">' +
    items.map(function (it, i) {
      const y = i * (rowH + gap), bw = (it.act / max) * barMax;
      const nm = it.nombre.length > 36 ? it.nombre.slice(0, 34) + '\u2026' : it.nombre;
      return '<g transform="translate(0,' + y + ')">' +
        '<text x="0" y="' + (rowH / 2 + 5) + '" font-family="JetBrains Mono,monospace" font-size="15" fill="' + c.acc + '">' + String(it.pos).padStart(2, '0') + '</text>' +
        '<text x="30" y="' + (rowH / 2 + 5) + '" font-family="Space Grotesk,sans-serif" font-size="14" fill="' + c.txt2 + '">' + esc(nm) + '</text>' +
        '<rect x="' + barX + '" y="9" width="' + barMax + '" height="' + (rowH - 18) + '" fill="' + c.track + '"/>' +
        '<rect x="' + barX + '" y="9" width="' + bw + '" height="' + (rowH - 18) + '" fill="' + riesgoCol(it.riesgo) + '"/>' +
        '<text x="' + (barX + barMax + 10) + '" y="' + (rowH / 2 + 5) + '" font-family="JetBrains Mono,monospace" font-size="15" fill="' + c.txt + '">' + it.act + '</text>' +
      '</g>';
    }).join('') + '</svg>';
}

function svgDona() {
  const c = C(), data = D.dist.slice();
  const total = data.reduce(function (a, b) { return a + b.pct; }, 0) || 1;
  const cx = 95, cy = 95, r = 66, sw = 22;
  const cols = [c.acc2, c.oro, c.bajo, c.medio, c.alto, c.txt3];
  let ang = -Math.PI / 2, segs = '';
  data.forEach(function (d, i) {
    const frac = d.pct / total, a2 = ang + frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    segs += '<path d="M ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' A ' + r + ' ' + r + ' 0 ' + (frac > 0.5 ? 1 : 0) + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + '" fill="none" stroke="' + cols[i % cols.length] + '" stroke-width="' + sw + '"/>';
    ang = a2;
  });
  return '<div class="dw"><svg viewBox="0 0 190 190" width="180" height="180">' + segs +
    '<text x="95" y="92" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="30" fill="' + c.txt + '">' + D.kpi.monit + '</text>' +
    '<text x="95" y="110" text-anchor="middle" font-size="10" letter-spacing="1.5" fill="' + c.txt3 + '">MODALIDADES</text></svg>' +
    '<div class="lg">' + data.map(function (d, i) {
      return '<div class="lr"><span class="ld" style="background:' + cols[i % cols.length] + '"></span>' +
        '<span class="ln2">' + esc(d.label) + '</span><span class="lp">' + d.pct + '%</span></div>';
    }).join('') + '</div></div>';
}


function tip(txt){
  return '<span class="ti" tabindex="0" role="button" aria-label="' + txt.replace(/"/g,'') + '">i<span class="tb">' + txt + '</span></span>';
}



function svgCanalRiesgo(){
  var c = C();
  var all = (D.top10||[]).concat(D.watch||[]);
  var canales = {};
  all.forEach(function(x){
    if(!canales[x.canal]) canales[x.canal] = {alto:0,medio:0,bajo:0,total:0};
    canales[x.canal][x.riesgo] = (canales[x.canal][x.riesgo]||0)+1;
    canales[x.canal].total++;
  });
  var ks = Object.keys(canales).sort(function(a,b){ return canales[b].total-canales[a].total; });
  if(!ks.length) return '<p class="vac">Sin datos suficientes.</p>';
  return '<div class="cr2">' + ks.map(function(k){
    var v = canales[k], t = v.total||1;
    return '<div class="crf"><div class="crn">'+esc(k)+'<span>'+v.total+'</span></div>'+
      '<div class="crb">'+
        (v.alto?'<span style="width:'+(v.alto/t*100)+'%;background:'+c.alto+'"></span>':'')+
        (v.medio?'<span style="width:'+(v.medio/t*100)+'%;background:'+c.medio+'"></span>':'')+
        (v.bajo?'<span style="width:'+(v.bajo/t*100)+'%;background:'+c.bajo+'"></span>':'')+
      '</div></div>';
  }).join('') + '</div>';
}

function svgEmergentes(){
  var c = C();
  var em = (D.top10||[]).filter(function(x){ return x.emergente; });
  if(!em.length) return '<p class="vac">No se detectaron modalidades emergentes en este periodo.</p>';
  return '<div class="emg">' + em.map(function(x){
    return '<div class="emi"><span class="emp">'+x.pos+'</span>'+
      '<span class="emn">'+esc(x.nombre)+'</span>'+
      '<span class="ema">'+x.act+'</span></div>';
  }).join('') + '</div>';
}

function tablaTendencia(){
  var all = (D.top10||[]).concat(D.watch||[]);
  var sube = all.filter(function(x){ return x.delta > 0; }).sort(function(a,b){ return b.delta-a.delta; }).slice(0,5);
  var baja = all.filter(function(x){ return x.delta < 0; }).sort(function(a,b){ return a.delta-b.delta; }).slice(0,5);
  function col(t, lista, cls){
    return '<div class="tcol"><div class="tct">'+t+'</div>'+
      (lista.length ? lista.map(function(x){
        return '<div class="tri"><span class="trn">'+esc(x.nombre)+'</span>'+
          '<span class="'+cls+'">'+(x.delta>0?'+':'')+x.delta+'</span></div>';
      }).join('') : '<p class="vac">Sin cambios registrados.</p>') + '</div>';
  }
  return '<div class="tgrid">' + col('Mayor aumento', sube, 'trup') + col('Mayor descenso', baja, 'trdn') + '</div>';
}

function paisesIntl(){
  var lista = D.paisesIntl || [];
  if(!lista.length) return '<p class="vac">Sin modalidades internacionales registradas.</p>';
  var NOMBRE = {ES:'España',MX:'México',CL:'Chile',CO:'Colombia',PE:'Perú',UY:'Uruguay',
                BR:'Brasil',US:'Estados Unidos',GB:'Reino Unido',AR:'Argentina'};
  var max = lista.reduce(function(m,p){ return Math.max(m,p.n); },1);
  return '<div class="pais">' + lista.map(function(p){
    return '<div class="pri"><span class="prn">'+esc(NOMBRE[p.pais]||p.pais)+'</span>'+
      '<span class="prb"><i style="width:'+(p.n/max*100)+'%"></i></span>'+
      '<span class="prc">'+p.n+'</span></div>';
  }).join('') + '</div>';
}

function mesCerrado(id){
  var hoy = new Date();
  var actual = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2);
  return String(id) < actual;   // solo los meses ya terminados
}

function informeHTML(i){
  var filas = (i.top || []).map(function(t){
    return '<tr><td>' + t.pos + '</td><td>' + esc(t.nombre) + '</td><td>' + esc(t.canal || '') +
      '</td><td>' + esc(t.riesgo || '') + '</td><td>' + t.act + '</td><td>' + esc(t.fuente || '') + '</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
    '<title>Observatorio de Fraude Digital \u2014 ' + esc(i.mes) + '</title><style>' +
    'body{font-family:Georgia,serif;max-width:820px;margin:40px auto;padding:0 24px;color:#2a2620;line-height:1.6}' +
    'h1{font-size:26px;margin:0 0 4px}h2{font-size:17px;margin:30px 0 10px;font-weight:500}' +
    '.kick{font-size:11px;letter-spacing:.2em;color:#0d5c58;font-family:monospace}' +
    '.sub{color:#6b6357;font-size:14px;margin-bottom:20px}hr{border:none;border-top:2px solid #0d5c58;margin:14px 0}' +
    'table{width:100%;border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px}' +
    'th{text-align:left;font-weight:600;border-bottom:2px solid #0d5c58;padding:8px 6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b6357}' +
    'td{border-bottom:.5px solid #e0d9c9;padding:9px 6px}.res{display:flex;gap:26px;margin:16px 0;font-size:14px}' +
    '.cita{margin-top:34px;padding-top:14px;border-top:.5px dashed #d8d0be;font-size:13px;color:#6b6357}' +
    '</style></head><body>' +
    '<div class="kick">CYBER MOBILE</div><h1>Observatorio de Fraude Digital</h1>' +
    '<div class="sub">Argentina \u00b7 Informe mensual \u00b7 ' + esc(i.mes) + '</div><hr>' +
    '<div class="res"><span><b>' + i.totalModalidades + '</b> modalidades nacionales</span>' +
    '<span><b>' + (i.internacionales || 0) + '</b> internacionales</span>' +
    '<span><b>' + (i.riesgo ? i.riesgo.alto : 0) + '</b> de riesgo alto</span></div>' +
    '<h2>Ranking del mes</h2>' +
    '<table><thead><tr><th>#</th><th>Modalidad</th><th>Canal</th><th>Riesgo</th><th>\u00cdndice</th><th>Fuente</th></tr></thead>' +
    '<tbody>' + filas + '</tbody></table>' +
    '<div class="cita">Aguilar, N. G. <i>Observatorio de Fraude Digital: estafas digitales en Argentina \u2014 edici\u00f3n ' +
    esc(i.mes) + '.</i> Cyber Mobile.</div></body></html>';
}



// Meses que fueron periodo de prueba y NO se publican como informe
var INFORMES_EXCLUIDOS = ['2026-08'];

// PDF de informes cerrados, generados por la tarea mensual (scripts/generar-informes-pdf.mjs).
var PDFS = [];
function pdfDe(id) { return PDFS.filter(function (p) { return p.id === id; })[0] || null; }
function descargar(p) {
  var a = document.createElement('a');
  a.href = p.url;
  a.download = 'Observatorio-Fraude-Digital-Cyber-Mobile-' + p.id + '.pdf';
  document.body.appendChild(a); a.click(); a.remove();
}
function informesPublicables() {
  return (D && D.informes || []).filter(function (i) { return INFORMES_EXCLUIDOS.indexOf(i.id) === -1; })
    .slice().sort(function (a, b) { return a.id < b.id ? 1 : -1; });
}
// Botón del encabezado y tarjeta destacada del último informe cerrado.
function pintarInforme() {
  var btn = document.querySelector('[data-act="pdf"]');
  var card = document.getElementById('informeCard');
  var pubs = informesPublicables();
  var cerrado = pubs.filter(function (i) { return mesCerrado(i.id); })[0] || null;
  var primero = pubs.length ? pubs[pubs.length - 1] : null;
  var pdf = cerrado ? pdfDe(cerrado.id) : null;
  if (btn) {
    btn.hidden = !pdf;
    var lbl = btn.querySelector('span');
    if (pdf && lbl) lbl.textContent = 'Informe de ' + cerrado.mes.replace(/ de \d{4}$/, '') + ' (PDF)';
  }
  if (!card) return;
  if (cerrado) {
    var esPrimero = primero && primero.id === cerrado.id;
    card.innerHTML = '<div class="ic-t"><span class="kick">' + (esPrimero ? 'Primer informe mensual' : '\u00daltimo informe mensual') + '</span>' +
      '<b>Informe de ' + esc(cerrado.mes) + '</b>' +
      '<span>Ranking cerrado del mes con el an\u00e1lisis de las ' + esc(cerrado.totalModalidades) + ' modalidades seguidas.</span></div>' +
      '<div class="ic-a">' +
      (pdf ? '<button type="button" class="cta" data-pdf="' + esc(pdf.id) + '">Descargar PDF</button>' : '') +
      '<a class="b" href="/observatorio/informe-observatorio.html?mes=' + esc(cerrado.id) + '" target="_blank" rel="noopener">Ver en l\u00ednea \u2197</a></div>';
    card.hidden = false;
  } else if (primero) {
    card.innerHTML = '<div class="ic-t"><span class="kick">Primer informe mensual</span>' +
      '<b>Informe de ' + esc(primero.mes) + '</b>' +
      '<span>Estar\u00e1 disponible para descargar al cierre del mes. Mientras tanto, el ranking se actualiza en vivo.</span></div>';
    card.hidden = false;
  } else {
    card.hidden = true;
  }
}

function listaInformes(){
  var inf = (D.informes || []).filter(function(i){
    return INFORMES_EXCLUIDOS.indexOf(i.id) === -1;
  });
  if(!inf.length){
    return '<p class="vac">Todav\u00eda no hay informes publicados. El primer informe mensual corresponde a septiembre de 2026 y estar\u00e1 disponible al cierre del mes. Las semanas anteriores fueron el per\u00edodo de puesta a punto del sistema.</p>';
  }
  return inf.map(function(i){
    var f = new Date(i.actualizado);
    var top3 = (i.top||[]).slice(0,3).map(function(t){ return t.pos+'. '+esc(t.nombre); }).join(' &middot; ');
    var cerrado = mesCerrado(i.id);
    var pdf = pdfDe(i.id);
    var accion = cerrado
      ? (pdf ? '<button type="button" class="verinf" data-pdf="'+esc(i.id)+'">Descargar PDF</button>' : '') +
        '<a class="encurso" href="/observatorio/informe-observatorio.html?mes='+esc(i.id)+'" target="_blank" rel="noopener">Ver en l\u00ednea \u2197</a>'
      : '<span class="encurso">Mes en curso \u00b7 disponible al cierre</span>';
    return '<article class="inf">'+
      '<div class="infh"><span class="infm">'+esc(i.mes)+'</span>'+
        '<span class="infacc">' + accion + '</span></div>'+
      '<div class="infb">'+
        '<span><strong>'+i.totalModalidades+'</strong> modalidades nacionales</span>'+
        '<span><strong>'+(i.internacionales||0)+'</strong> internacionales</span>'+
        '<span><strong>'+(i.riesgo?i.riesgo.alto:0)+'</strong> de riesgo alto</span>'+
        '<span class="infd">actualizado '+('0'+f.getDate()).slice(-2)+'.'+('0'+(f.getMonth()+1)).slice(-2)+'.'+f.getFullYear()+'</span>'+
      '</div>'+
      '<div class="inft">'+top3+'</div>'+
    '</article>';
  }).join('');
}


function copiarCita(btn){
  var cont = btn.closest('.citaBox');
  var txt = cont ? cont.querySelector('.cita').innerText.trim() : '';
  if (!txt) return;
  function ok(){
    var prev = btn.getAttribute('data-lbl') || btn.textContent;
    btn.setAttribute('data-lbl', prev);
    btn.textContent = '✓ COPIADO';
    btn.classList.add('done');
    setTimeout(function(){ btn.textContent = prev; btn.classList.remove('done'); }, 1800);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(ok).catch(function(){ fallback(); });
  } else { fallback(); }
  function fallback(){
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch(e) {}
    document.body.removeChild(ta);
  }
}

// ===== Descarga del informe mensual (solo meses ya cerrados) =====
function mesCerrado(id){
  var hoy = new Date();
  var actual = hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2);
  return String(id) < actual;   // '2026-09' < '2026-10'
}



function miniRanking(lista, titulo, esIntl){
  if (!lista || !lista.length) return '';
  return '<aside class="mini"><div class="mtit">' + titulo + '</div>' +
    lista.map(function(x){
      return '<a class="mrow" href="#' + idEntrada(x, esIntl) + '"><span class="mp">' + x.pos + '</span>' +
        '<span class="mn">' + esc(x.nombre) + '</span>' +
        '<span class="ma">' + x.act + '</span></a>';
    }).join('') + '</aside>';
}


// Selector Hoy / Este mes (diario vs mensual)
var VISTA = { top: 'mes', intl: 'mes' };
function rankTop(){
  if (VISTA.top === 'dia') return (D.top10_dia && D.top10_dia.length) ? D.top10_dia : [];
  return D.top10 || [];
}
function rankIntl(){
  if (VISTA.intl === 'dia') return (D.internacional_dia && D.internacional_dia.length) ? D.internacional_dia : [];
  return D.internacional || [];
}
function pintarTop(){
  var lista = rankTop();
  var cont = document.getElementById('topList');
  if (!lista.length && VISTA.top === 'dia') {
    cont.innerHTML = '<p class="vacio-dia">No se registraron modalidades nuevas en las \u00faltimas 48 horas. Mir\u00e1 el ranking del mes para ver la actividad acumulada.</p>';
  } else {
    var vis = lista.filter(aplicaFiltro);
    cont.innerHTML = vis.length
      ? vis.map(function(x){ return entrada(x, false); }).join('')
      : '<p class="vacio-dia">Ninguna estafa del ranking coincide con el filtro. Prob\u00e1 con otra palabra o eleg\u00ed \u201cTodos\u201d.</p>';
  }
  pintarFiltros();
  var mt = document.getElementById('miniTop');
  if (mt) mt.innerHTML = miniLista(lista, VISTA.top === 'dia' ? 'Hoy' : 'Este mes');
}
function pintarIntl(){
  var lista = rankIntl();
  var cont = document.getElementById('intlList');
  if (!cont) return;
  if (!lista.length && VISTA.intl === 'dia') {
    cont.innerHTML = '<p class="vacio-dia">Sin modalidades del exterior en las \u00faltimas 48 horas.</p>';
  } else if (!lista.length) {
    cont.innerHTML = '<p class="vacio-dia">Sin modalidades internacionales registradas.</p>';
  } else {
    cont.innerHTML = lista.map(function(x){ return entrada(x, true); }).join('');
  }
}
function setVista(cual, valor){
  VISTA[cual] = valor;
  document.querySelectorAll('.selv[data-sel="'+cual+'"] .selbtn').forEach(function(b){
    b.classList.toggle('on', b.dataset.val === valor);
  });
  if (cual === 'top') pintarTop(); else pintarIntl();
}
// miniLista: reutiliza el formato del mini-ranking lateral si existe
function miniLista(lista, titulo){
  if (typeof miniRanking === 'function') return miniRanking(lista, titulo || 'Ranking');
  return '';
}

function render() {
  var T = {
    barras: 'Cada barra muestra el \u00edndice de actividad de una estafa, de 0 a 100. Cuanto m\u00e1s larga, m\u00e1s presente est\u00e1 esa estafa en alertas y publicaciones. El color indica el nivel de riesgo: rojo alto, \u00e1mbar medio.',
    canal: 'Por d\u00f3nde llega el fraude a la v\u00edctima: correo, WhatsApp, redes sociales, SMS o llamada. El porcentaje se calcula ponderando el \u00edndice de cada estafa, no contando cu\u00e1ntas hay.',
    riesgo: 'Alto: puede derivar en p\u00e9rdida de dinero o robo de identidad. Medio: requiere varios pasos de la v\u00edctima o el da\u00f1o es acotado. Bajo: baja tasa de \u00e9xito o impacto limitado.'
  };
  var h;
  h = document.getElementById('tBarras'); if (h) h.innerHTML = 'RANKING POR \u00cdNDICE DE ACTIVIDAD' + tip(T.barras);
  h = document.getElementById('tCanal'); if (h) h.innerHTML = 'DISTRIBUCI\u00d3N POR CANAL DE CONTACTO' + tip(T.canal);
  h = document.getElementById('tRiesgo'); if (h) h.innerHTML = 'NIVEL DE RIESGO EN EL RANKING' + tip(T.riesgo);

  const c = C();
  pintarInforme();
  var rs = document.getElementById('resumen');
  if (rs) rs.innerHTML = resumenHTML();
  pintarTop();
  var mt = document.getElementById('miniTop');
  if (mt) mt.innerHTML = miniRanking(D.top10, 'Ranking del mes');

  pintarIntl();
  var mi = document.getElementById('miniIntl');
  if (mi) mi.innerHTML = miniRanking(rankIntl(), 'Internacional', true);

  const w = document.getElementById('watchList');
  if (!D.watch || !D.watch.length) {
    w.innerHTML = '<p class="vac">Todav\u00eda no hay modalidades en vigilancia. Aparecen ac\u00e1 cuando el observatorio sigue m\u00e1s de diez estafas activas en el per\u00edodo.</p>';
  } else {
    w.innerHTML = D.watch.map(function (x) {
      return '<div class="wr"><span class="wn">' + x.pos + '</span><span class="wnm">' + esc(x.nombre) +
        '</span><span class="wc">' + esc(x.canal) + '</span><span class="wa">' + x.act + '</span></div>';
    }).join('');
  }

  document.getElementById('kpis').innerHTML = [
    ['Modalidades monitoreadas', D.kpi.monit, 'en seguimiento este mes',
     'Todas las estafas que el observatorio sigue actualmente: las del ranking principal m\u00e1s las que est\u00e1n en vigilancia esperando confirmaci\u00f3n.'],
    ['Emergentes', D.kpi.emerg, 'sin registro relevante previo',
     'Estafas que aparecieron este mes y no ten\u00edan presencia en per\u00edodos anteriores. Suelen ser las m\u00e1s peligrosas porque casi nadie las conoce todav\u00eda.'],
    ['En aumento', D.kpi.sube, 'subieron su \u00edndice',
     'Estafas que este mes recibieron m\u00e1s alertas y cobertura que el mes pasado. Est\u00e1n circulando con m\u00e1s fuerza.'],
    ['En descenso', D.kpi.baja, 'bajaron su \u00edndice',
     'Estafas con menos alertas que el mes anterior. Siguen existiendo, pero est\u00e1n perdiendo intensidad.']
  ].map(function (k) {
    return '<div class="kp"><div class="kn">' + k[1] + '</div><div class="kl">' + k[0] + tip(k[3]) + '</div><div class="ks">' + k[2] + '</div></div>';
  }).join('');

  document.getElementById('barras').innerHTML = svgBarras();
  document.getElementById('dist').innerHTML = svgDona();

  const r = D.riesgo, tot = (r.alto + r.medio + r.bajo) || 1;
  var el;
  el = document.getElementById('canalRiesgo'); if (el) el.innerHTML = svgCanalRiesgo();
  el = document.getElementById('emergentes'); if (el) el.innerHTML = svgEmergentes();
  el = document.getElementById('tendencia'); if (el) el.innerHTML = tablaTendencia();
  el = document.getElementById('paisesIntl'); if (el) el.innerHTML = paisesIntl();
  el = document.getElementById('informesList'); if (el) el.innerHTML = listaInformes();

  var filas = [['Alto', r.alto, c.alto, 'pérdida de dinero o entrega de credenciales'],
               ['Medio', r.medio, c.medio, 'requiere varios pasos o el daño es acotado'],
               ['Bajo', r.bajo, c.bajo, 'baja tasa de éxito o impacto menor']];
  document.getElementById('riesgoBar').innerHTML = '<div class="rlist">' + filas.map(function(f){
    return '<div class="rrow">' +
      '<span class="rnom"><i style="background:' + f[2] + '"></i>' + f[0] + '</span>' +
      '<span class="rbar"><b style="width:' + (f[1] / tot * 100) + '%;background:' + f[2] + '"></b></span>' +
      '<span class="rnum">' + f[1] + '</span>' +
      '<span class="rdesc">' + f[3] + '</span></div>';
  }).join('') + '</div>';

  const f = new Date(D.meta.actualizado);
  const p = function (n) { return ('0' + n).slice(-2); };
  document.querySelectorAll('[data-mes]').forEach(function (e) { e.textContent = D.meta.mes; });
  document.getElementById('stamp').textContent =
    '\u25c8 MONITOREO ACTIVO \u00b7 ' + p(f.getDate()) + '.' + p(f.getMonth() + 1) + '.' + f.getFullYear() + ' ' + p(f.getHours()) + ':' + p(f.getMinutes());
  document.getElementById('cnt').textContent = D.kpi.monit + ' MODALIDADES EN SEGUIMIENTO';
  var textoCita = 'Aguilar, N. G. (' + f.getFullYear() + '). Observatorio de Fraude Digital: estafas digitales en Argentina \u2014 edici\u00f3n ' + D.meta.mes + '. Cyber Mobile.';
  document.querySelectorAll('.cita').forEach(function (el) {
    el.innerHTML = 'Aguilar, N. G. (' + f.getFullYear() + '). <em>Observatorio de Fraude Digital: estafas digitales en Argentina \u2014 edici\u00f3n ' + esc(D.meta.mes) + '.</em> Cyber Mobile.';
  });
  window.__CITA__ = textoCita;
}

window.addEventListener('hashchange', function () {
  var hash = (location.hash || '').slice(1);
  var el = /^[ei]\d+$/.test(hash) ? document.getElementById(hash) : null;
  if (el && !el.classList.contains('open')) toggleEntrada(el.querySelector('.ent-h'));
});

function setTab(t) {
  document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b.dataset.val === t); });
  document.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('on', p.dataset.pane === t); });
  // Lleva la vista al inicio del contenido de la pestaña (debajo de la barra fija).
  var nav = document.querySelector('nav.tabs');
  if (nav) {
    var barra = document.querySelector('.topbar');
    var y = nav.getBoundingClientRect().top + window.pageYOffset - (barra ? barra.offsetHeight : 0) - 8;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }
}

function copiarCita(btn){
  var txt = window.__CITA__ || '';
  function ok(){ var o = btn.textContent; btn.textContent = '\u2713'; setTimeout(function(){ btn.textContent = o; }, 1400); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(ok, function(){ fallback(); });
  } else { fallback(); }
  function fallback(){
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch(e) {}
    document.body.removeChild(ta);
  }
}

function boot() {
  // Delegación de eventos para el selector Hoy/Este mes (CSP no permite onclick inline)
  document.addEventListener('click', function(ev){
    var b = ev.target.closest ? ev.target.closest('.selbtn') : null;
    if (!b) return;
    var cont = b.closest('.selv');
    if (!cont) return;
    setVista(cont.dataset.sel, b.dataset.val);
  });

  document.addEventListener('click', function(ev){
    var t = ev.target.closest ? ev.target.closest('[data-act="copiar"]') : null;
    if (t) copiarCita(t);
  });
  // los botones se crean dinamicamente: delegacion de eventos
  document.querySelectorAll('[data-act]').forEach(function (el) {
    el.addEventListener('click', function () {
      const a = el.dataset.act;
      if (a === 'modo') toggleModo();
      else if (a === 'pdf' && PDFS[0]) descargar(PDFS[0]);
      else if (a === 'tab') setTab(el.dataset.val);
    });
  });
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-pdf]') : null;
    if (!b) return;
    var p = pdfDe(b.dataset.pdf);
    if (p) descargar(p);
  });
  fetch('/observatorio/informes/index.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : { informes: [] }; })
    .then(function (j) { PDFS = j.informes || []; if (D) { pintarInforme(); var il = document.getElementById('informesList'); if (il) il.innerHTML = listaInformes(); } })
    .catch(function () {});

  // Tarjetas desplegables del ranking
  document.addEventListener('click', function (ev) {
    var h = ev.target.closest ? ev.target.closest('.ent-h') : null;
    if (h) toggleEntrada(h);
  });
  // Filtros por canal
  document.addEventListener('click', function (ev) {
    var f = ev.target.closest ? ev.target.closest('.fchip') : null;
    if (!f) return;
    FILTRO.canal = f.dataset.canal;
    pintarTop();
  });
  var q = document.getElementById('buscar');
  if (q) q.addEventListener('input', function () { FILTRO.q = q.value.trim(); pintarTop(); });

  aplicarModo();
  fetch('/observatorio/datos.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (j) {
      D = j;
      var hash = (location.hash || '').slice(1);
      if (/^[ei]\d+$/.test(hash)) {
        ABIERTA = hash;
        if (hash.charAt(0) === 'i') setTab('intl');
      } else if (D.top10 && D.top10.length) {
        ABIERTA = 'e' + D.top10[0].pos;
      }
      render();
      document.getElementById('err').style.display = 'none';
      if (/^[ei]\d+$/.test(hash)) {
        var el = document.getElementById(hash);
        if (el) setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 60);
      }
    })
    .catch(function (e) {
      const b = document.getElementById('err');
      b.style.display = 'block';
      b.textContent = 'No se pudieron cargar los datos del observatorio. Record\u00e1 la p\u00e1gina. (' + e.message + ')';
    });
}
document.addEventListener('DOMContentLoaded', boot);
