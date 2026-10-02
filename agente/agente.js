// Vera, agente web de Cyber Mobile (/agente). La lógica de cupos y suscripción vive en el servidor.
(function(){
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICON = {
  link:'<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>',
  mensaje:'<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/></svg>',
  cbu:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
  tel:'<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>',
  email:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  archivo:'<svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></svg>',
  red:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
  audio:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
  obs:'<svg viewBox="0 0 24 24"><path d="M3 20h18M6 16V9M11 16V5M16 16v-4M21 16V8"/></svg>'
};
const TIPOS = [
  {id:'link', n:'Link', ph:'Pegá el link que te mandaron', ej:['http://pami-actualiza-datos.xyz/login','https://www.mercadopago.com.ar/ayuda','bit.ly/reintegro-anses']},
  {id:'mensaje', n:'Mensaje', ph:'Pegá el texto del mensaje que recibiste', ej:['PAMI: su credencial vence hoy. Actualice sus datos para no perder la cobertura: pami-tramites.online','Hola, te pasé un código de 6 dígitos por error, ¿me lo reenviás?','Invertí $50.000 y recibí $400.000 en 7 días. Cupos limitados.']},
  {id:'cbu', n:'CBU / Alias', ph:'Pegá el CBU, CVU o alias al que te piden transferir', ej:['2850590940090418135201','premio.sorteo.ya','0000003100010000000009']},
  {id:'tel', n:'Teléfono', ph:'Pegá el número que te contactó', ej:['+234 803 555 1234','+54 9 11 3456-7890','0800 222 7262']},
  {id:'email', n:'Email', ph:'Pegá la dirección del remitente', ej:['soporte@arca-gob-ar.com','notificaciones@mercadopago.com','banco.nacion.alerta@gmail.com']},
  {id:'archivo', n:'Archivo', ph:'', ej:[]}
];

// --- Estado del visitante (lo decide el servidor) ---
const WA_NUM = '5491170598505';
const waLink = t => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(t)}`;
const WA_URL = waLink('Hola Vera, quiero probar los 7 días gratis');
const est = { configurado: true, gratis: 2, restantes: 2, vinculado: false, telefono: '', suscripto: false };
function pintarCupo(){
  const quedan = est.restantes, g = est.gratis;
  if (est.suscripto) {
    $('#pts').innerHTML = '';
    $('#cupoTxt').innerHTML = '<span class="activo">Plan Protección activo</span>';
    $('#restan').innerHTML = 'Plan Protección activo · consultas ilimitadas';
  } else {
    $('#pts').innerHTML = Array.from({length:g}, (_, i) => `<i class="${i >= quedan ? 'usado' : ''}"></i>`).join('');
    $('#cupoTxt').innerHTML = quedan > 0 ? `<b>${quedan}</b> ${quedan === 1 ? 'consulta gratis' : 'consultas gratis'}` : 'Sin consultas gratis';
    $('#restan').innerHTML = quedan > 0 ? `Te ${quedan === 1 ? 'queda' : 'quedan'} <b>${quedan}</b> ${quedan === 1 ? 'consulta gratis' : 'consultas gratis'}` : 'Usaste tus consultas gratis · <b>Suscribite</b> para seguir';
  }
  $('#cuenta').textContent = est.vinculado ? `${est.telefono} · Salir` : (est.configurado ? 'Ya soy suscriptor' : '');
}
// La sesión viaja en una cookie; además se guarda una copia firmada en el navegador
// por si alguna extensión o configuración descarta la cookie al recargar.
function leerToken(){ try { return localStorage.getItem('cm_sesion') || ''; } catch (e) { return ''; } }
function guardarToken(t){ try { if (t) localStorage.setItem('cm_sesion', t); } catch (e) {} }
async function api(ruta, opciones){
  const headers = { 'Content-Type': 'application/json' };
  const t = leerToken(); if (t) headers['X-CM-Sesion'] = t;
  const r = await fetch('/api/agente/' + ruta, Object.assign({ credentials: 'same-origin', cache: 'no-store', headers }, opciones || {}));
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (j && j.sesion) guardarToken(j.sesion);
  return { status: r.status, ...j };
}
async function cargarEstado(){
  try { const j = await api('estado'); if (j.status === 200) Object.assign(est, j); } catch (e) {}
  pintarCupo();
}
$('#cuenta').addEventListener('click', async () => {
  if (est.vinculado) {
    await api('vincular', { method: 'POST', body: JSON.stringify({ accion: 'salir' }) });
    await cargarEstado(); aviso('Desvinculaste tu WhatsApp de este navegador.');
  } else abrirMuro('vincular');
});

// --- Pestañas de la portada ---
const tabs = [...document.querySelectorAll('.tab')];
function abrirTab(id){
  tabs.forEach(t => { const on = t.id === 't-' + id; t.setAttribute('aria-selected', on); document.getElementById(t.getAttribute('aria-controls')).hidden = !on; });
}
tabs.forEach(t => t.addEventListener('click', () => abrirTab(t.id.slice(2))));
document.querySelector('.tabs').addEventListener('keydown', e => {
  const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click(); }
});
document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => abrirTab(b.dataset.ir)));

// --- Tipos de consulta ---
let tipo = 'link', tipoChat = 'link', archivoSel = null;
function pintarTipos(cont, actual, alElegir){
  cont.innerHTML = TIPOS.map(t => `<button class="tipo" data-t="${t.id}" aria-pressed="${t.id === actual}">${ICON[t.id]}${t.n}</button>`).join('');
  cont.onclick = e => { const b = e.target.closest('.tipo'); if (b) alElegir(b.dataset.t); };
}
function elegirTipo(id){
  tipo = id;
  const t = TIPOS.find(x => x.id === id);
  pintarTipos($('#tiposPortada'), id, elegirTipo);
  $('#consola').classList.toggle('es-archivo', id === 'archivo');
  $('#entrada').placeholder = t.ph;
  $('#ejemplos').innerHTML = t.ej.length ? '<span class="mono" style="font-size:11.5px;color:var(--muted);align-self:center">Ejemplos:</span>' + t.ej.map(x => `<button class="ej" title="${esc(x)}">${esc(x)}</button>`).join('') : '';
}
$('#ejemplos').addEventListener('click', e => { const b = e.target.closest('.ej'); if (b) { $('#entrada').value = b.title; $('#entrada').focus(); } });
function elegirTipoChat(id){
  if (id === 'archivo') { $('#fChat').click(); return; }
  tipoChat = id; pintarTipos($('#tiposChat'), id, elegirTipoChat);
  $('#entradaChat').placeholder = TIPOS.find(x => x.id === id).ph;
}
const CANALES = { REDES:'Redes sociales', WHATSAPP:'WhatsApp', TELEFONO:'Teléfono', SMS:'SMS', EMAIL:'Email', MARKETPLACE:'Marketplace', WEB:'Sitios web' };
const TILDES = [[/\binversion\b/gi,'inversión'],[/\bsextorsion\b/gi,'sextorsión'],[/\bsuplantacion\b/gi,'suplantación'],[/\bprestamo\b/gi,'préstamo'],[/\btelefono\b/gi,'teléfono'],[/\bromantico\b/gi,'romántico']];
const tildes = t => TILDES.reduce((a, x) => a.replace(x[0], m => m[0] === m[0].toUpperCase() ? x[1][0].toUpperCase() + x[1].slice(1) : x[1]), String(t || ''));
fetch('/observatorio/datos.json', { cache: 'no-cache' }).then(r => r.json()).then(d => {
  const top = (d.top10 || []).slice(0, 3);
  if (d.meta && d.meta.mes) $('#vivoMes').textContent = 'OBSERVATORIO DE FRAUDE DIGITAL · ' + String(d.meta.mes).toUpperCase();
  $('#top3').innerHTML = top.map((m, i) => `<div class="fila"><div class="pos">#${i + 1}</div><div style="min-width:0"><b>${esc(tildes(m.nombre))}</b><small>${esc(CANALES[m.canal] || m.canal || '')}</small><div class="barra"><i style="width:${Math.max(0, Math.min(100, +m.act || 0))}%"></i></div></div><a class="chip c-alto" style="text-decoration:none" href="/observatorio/${esc(String(m.key || '').replace(/_/g, '-'))}">${+m.act || 0}/100</a></div>`).join('');
}).catch(() => { $('#top3').innerHTML = '<p class="nota">No pudimos cargar el ranking. <a href="/observatorio" style="color:var(--acc)">Abrir el Observatorio</a></p>'; });

// Archivo en la portada
const zona = $('#zonaArchivo');
$('#fArchivo').addEventListener('change', e => { archivoSel = e.target.files[0] || null; $('#zonaTxt').innerHTML = archivoSel ? `<b>${esc(archivoSel.name)}</b><br><small>${(archivoSel.size / 1024).toFixed(0)} KB · listo para analizar</small>` : '<b>Elegí un archivo</b> o arrastralo acá'; });
['dragenter','dragover'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.add('drag'); }));
['dragleave','drop'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.remove('drag'); }));
zona.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) { archivoSel = f; $('#zonaTxt').innerHTML = `<b>${esc(f.name)}</b><br><small>${(f.size / 1024).toFixed(0)} KB · listo para analizar</small>`; } });

// ================== Tipo de consulta ==================
// Se detecta por el contenido; la pestaña elegida solo cambia el texto de ayuda.
function detectarTipo(s){
  const t = s.trim();
  if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(t)) return 'email';
  if (/^[\d\s-]{22,26}$/.test(t) && t.replace(/\D/g, '').length === 22) return 'cbu';
  if (/^\+?[\d\s().-]{8,}$/.test(t)) return 'tel';
  if (!/\s/.test(t) && /\.[a-z]{2,}(\/|$|\?|#)/i.test(t) && !/^[a-z0-9.\-]{6,20}$/i.test(t.replace(/^https?:\/\//, '')) ) return 'link';
  if (!/\s/.test(t) && /^(https?:\/\/|www\.)/i.test(t)) return 'link';
  if (!/\s/.test(t) && /^[a-z0-9.\-]{6,20}$/i.test(t) && t.includes('.')) return /\.(com|ar|net|org|xyz|online|site|top|info|shop|app|io|link|ly)$/i.test(t) ? 'link' : 'cbu';
  return 'mensaje';
}
const PASOS_ANALISIS = {
  link:['Abriendo el link en un entorno aislado','Consultando 70 motores de seguridad (VirusTotal)','Comparando con sitios oficiales','Cruzando con el Observatorio'],
  mensaje:['Leyendo el mensaje','Buscando señales de engaño','Revisando links incluidos','Cruzando con el Observatorio'],
  cbu:['Validando dígitos de control','Identificando el banco o billetera','Buscando denuncias','Cruzando con el Observatorio'],
  tel:['Identificando el origen del número','Buscando reportes de fraude','Cruzando con el Observatorio'],
  email:['Revisando el dominio del remitente','Buscando el email en filtraciones de datos','Cruzando con el Observatorio'],
  archivo:['Calculando la huella del archivo','Analizando con 70 motores antivirus','Revisando permisos y macros']
};

// ================== Chat ==================
const hilo = $('#hilo');
function scroll(){ const m = $('#mensajes'); m.scrollTop = m.scrollHeight; }
function burbuja(cls, html){ const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; hilo.appendChild(d); scroll(); return d; }
const espera = ms => new Promise(r => setTimeout(r, ms));
let ocupado = false, saludo = false;
function saludar(){
  if (saludo) return; saludo = true;
  burbuja('ella', '<p>Hola, soy <b>Vera</b>, el agente de Cyber Mobile. 👋</p><p>Pegame un link, un mensaje, un CBU, un número o un archivo, y te digo si es una estafa.</p>');
}
function medidor(p, nivel){
  const col = `var(--${nivel === 'desconocido' ? 'muted' : nivel})`, r = 32, c = 2 * Math.PI * r;
  return `<div class="medidor"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="38" cy="38" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p / 100)}"/></svg><b style="color:${col}">${nivel === 'desconocido' ? '?' : p}</b></div>`;
}
const MARCA = { ok: ['✓', 'c-bajo'], alerta: ['!', 'c-medio'], peligro: ['✕', 'c-alto'] };
function tarjeta(r){
  const etiqueta = { alto:'RIESGO ALTO', medio:'RIESGO MEDIO', bajo:'RIESGO BAJO', desconocido:'SIN DATOS SUFICIENTES' }[r.nivel];
  const chipCls = r.nivel === 'desconocido' ? '' : 'c-' + r.nivel;
  const d = document.createElement('div'); d.className = 'veredicto';
  d.innerHTML = `<div class="v-cab">${medidor(r.puntaje, r.nivel)}<div style="min-width:0"><span class="chip ${chipCls}">${etiqueta}</span><h3>${esc(r.titulo)}</h3>${r.resumen ? `<p>${esc(r.resumen).replace(/\n/g, '<br>')}</p>` : ''}</div></div>
    ${r.hallazgos.length ? `<div class="v-sec"><small>QUÉ ENCONTRÉ</small><ul>${r.hallazgos.map(h => `<li><i class="${MARCA[h.tipo][1]}">${MARCA[h.tipo][0]}</i><span>${esc(h.texto)}</span></li>`).join('')}</ul></div>` : ''}
    ${r.modalidad ? `<div class="v-sec"><div class="modal"><span>Coincide con <b>${esc(r.modalidad.nombre)}</b>, en el Observatorio</span><a href="/observatorio/${esc(r.modalidad.slug)}" target="_blank" rel="noopener">Ver ficha →</a></div></div>` : ''}
    ${r.pasos.length ? `<div class="v-sec"><small>QUÉ HACER</small><ul>${r.pasos.map((p, i) => `<li><i style="color:var(--acc)">${i + 1}</i><span>${esc(p)}</span></li>`).join('')}</ul></div>` : ''}
    ${r.nivel === 'alto' || r.nivel === 'medio' ? `<div class="v-wa"><span>En WhatsApp, Vera además <b>analiza este patrón con IA</b> y te avisa si es parte de una campaña activa.</span><a href="${WA_URL}" target="_blank" rel="noopener">Probar →</a></div>` : ''}
    <div class="v-pie">Análisis automático de Vera · Cyber Mobile. Ante la duda, no respondas ni transfieras.</div>`;
  hilo.appendChild(d); scroll();
}
function leerArchivo(f){
  return new Promise((ok, mal) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1] || ''); fr.onerror = () => mal(fr.error); fr.readAsDataURL(f); });
}
const esAudio = f => /^audio\//.test(f.type) || /\.(mp3|ogg|opus|m4a|wav|aac)$/i.test(f.name);
async function consultar(tipoElegido, texto, archivo){
  if (ocupado) return;
  if (archivo && esAudio(archivo)) {
    burbuja('yo', `<span class="adj">🎤 ${esc(archivo.name)}</span>`);
    await espera(500);
    burbuja('ella', `<p>Los <b>audios</b> los analizo en WhatsApp: ahí los transcribo y detecto si es una voz que se hace pasar por alguien. Esta consulta no se descontó.</p><p><a href="${WA_URL}" target="_blank" rel="noopener" style="color:var(--bajo);font-weight:600">Reenviámelo por WhatsApp →</a></p>`);
    return;
  }
  if (archivo && archivo.size > 3 * 1024 * 1024) { burbuja('ella', '<p>Ese archivo supera los 3 MB. Probá con una captura más liviana o mandámelo por WhatsApp.</p>'); return; }
  if (!est.suscripto && est.restantes <= 0 && !est.vinculado) { abrirMuro(); return; }
  ocupado = true;
  burbuja('yo', archivo ? `<span class="adj">📎 ${esc(archivo.name)}</span>` : esc(texto));
  const tipoReal = archivo ? 'archivo' : detectarTipo(texto);
  const b = burbuja('ella', '<div class="pensando"></div>');
  const cont = b.firstChild;
  let pedido;
  try {
    const cuerpo = archivo
      ? { tipo: 'archivo', archivo: { nombre: archivo.name, mime: archivo.type || (/\.apk$/i.test(archivo.name) ? 'application/vnd.android.package-archive' : ''), datos: await leerArchivo(archivo) } }
      : { tipo: tipoReal, valor: texto };
    pedido = api('consulta', { method: 'POST', body: JSON.stringify(cuerpo) });
  } catch (e) { pedido = Promise.resolve({ status: 0, error: 'No pude leer el archivo.' }); }
  // Mientras Vera trabaja, se muestran los pasos del análisis.
  let listo = false, resp;
  pedido.then(x => { resp = x; listo = true; }, () => { resp = { status: 0 }; listo = true; });
  const pasos = PASOS_ANALISIS[tipoReal === 'tel' ? 'tel' : tipoReal] || PASOS_ANALISIS.mensaje;
  for (let k = 0; k < pasos.length; k++) {
    const fila = document.createElement('div'); fila.textContent = pasos[k]; cont.appendChild(fila); scroll();
    if (k === pasos.length - 1) break;   // el último paso queda girando hasta que responde
    const hasta = Date.now() + (listo ? 250 : 1100 + Math.random() * 500);
    while (Date.now() < hasta) await espera(100);
    fila.classList.add('ok');
  }
  while (!listo) await espera(150);
  cont.lastChild && cont.lastChild.classList.add('ok');
  await espera(250);
  b.remove();
  ocupado = false;
  if (resp.status === 200 && resp.resultado) {
    tarjeta(resp.resultado);
    if (resp.modo === 'gratis') { est.restantes = resp.restantes; pintarCupo(); }
    if (resp.modo === 'suscripcion' && !est.suscripto) { est.suscripto = true; pintarCupo(); }
    await espera(400);
    if (!est.suscripto) burbuja('ella', est.restantes > 0 ? `<p>Te queda <b>${est.restantes}</b> consulta gratis. ¿Querés verificar otra cosa?</p>` : '<p>Esa fue tu última consulta gratis. Si te llega algo más, suscribite y seguimos sin límite, acá o por WhatsApp.</p>');
    if (!est.suscripto && est.restantes <= 0) setTimeout(() => abrirMuro(), 1600);
    return;
  }
  if (resp.status === 402) { est.restantes = 0; pintarCupo(); burbuja('ella', '<p>Ya usaste tus consultas gratis. Suscribite para seguir verificando sin límite.</p>'); abrirMuro(); return; }
  if (resp.codigo === 'solo_whatsapp') { burbuja('ella', `<p>${esc(resp.error)}</p><p><a href="${WA_URL}" target="_blank" rel="noopener" style="color:var(--bajo);font-weight:600">Abrir WhatsApp →</a></p>`); return; }
  if (resp.codigo === 'no_configurado') { burbuja('ella', `<p>${esc(resp.error)}</p><p><a href="${WA_URL}" target="_blank" rel="noopener" style="color:var(--bajo);font-weight:600">Escribirle a Vera por WhatsApp →</a></p>`); return; }
  burbuja('ella', `<p>${esc(resp.error || 'No pude completar el análisis. Revisá tu conexión y probá de nuevo.')}</p>${resp.status >= 500 || !resp.status ? '<p style="color:var(--muted);font-size:13.5px">Esta consulta no se descontó.</p>' : ''}`);
}
function irChat(){
  $('#portada').hidden = true; $('#chat').hidden = false;
  document.body.style.overflow = 'hidden';
  saludar(); scroll();
}
function irPortada(){ $('#chat').hidden = true; $('#portada').hidden = false; document.body.style.overflow = ''; }
$('#volver').addEventListener('click', irPortada);
$('#irPortada').addEventListener('click', e => { e.preventDefault(); irPortada(); });
$('#analizar').addEventListener('click', () => {
  const texto = $('#entrada').value.trim();
  if (tipo === 'archivo' ? !archivoSel : !texto) { aviso(tipo === 'archivo' ? 'Elegí un archivo para analizar.' : 'Pegá algo para analizar o tocá un ejemplo.'); return; }
  irChat();
  const a = tipo === 'archivo' ? archivoSel : null;
  setTimeout(() => consultar(tipo, texto, a), 400);
  $('#entrada').value = '';
});
$('#entrada').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#analizar').click(); });
function enviarChat(){ const t = $('#entradaChat').value.trim(); if (!t) return; if (ocupado) { aviso('Esperá a que Vera termine el análisis.'); return; } $('#entradaChat').value = ''; consultar(tipoChat, t, null); }
$('#enviar').addEventListener('click', enviarChat);
$('#entradaChat').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarChat(); } });
$('#fChat').addEventListener('change', e => { const f = e.target.files[0]; if (f && ocupado) { aviso('Esperá a que Vera termine el análisis.'); } else if (f) consultar('archivo', '', f); e.target.value = ''; });

// ================== Suscripción y vinculación con WhatsApp ==================
let sondeo = null;
function pararSondeo(){ if (sondeo) { clearInterval(sondeo); sondeo = null; } }
function pasoMuro(){
  const p = $('#muroPaso');
  if (est.vinculado) {
    p.innerHTML = `<p class="aviso" style="color:var(--txt2)">Tu WhatsApp <b>${esc(est.telefono)}</b> está vinculado. Para suscribirte, escribile a Vera "Quiero suscribirme" y te manda el link de pago de Mercado Pago.</p>
      <div class="fila-b"><a class="btn btn-p" href="${waLink('Quiero suscribirme')}" target="_blank" rel="noopener">Suscribirme por WhatsApp</a><button type="button" class="btn btn-s" id="yaPague">Ya pagué, actualizar</button></div>`;
    $('#yaPague').onclick = async () => { await cargarEstado(); if (est.suscripto) { cerrarMuro(); aviso('Listo: tu plan Protección está activo.'); } else aviso('Todavía no vemos el pago. Si ya pagaste, mandale el comprobante a Vera por WhatsApp.'); };
  } else {
    p.innerHTML = `<div class="fila-b"><button type="button" class="btn btn-p" id="empezarVinc">Suscribirme</button><a class="btn btn-s" href="${WA_URL}" target="_blank" rel="noopener">Probar 7 días en WhatsApp</a></div>
      <p class="aviso">¿Ya sos suscriptor? <button type="button" class="link-btn" id="soySus">Vinculá tu WhatsApp</button> y seguí sin límite acá.</p>`;
    $('#empezarVinc').onclick = iniciarVinculo; $('#soySus').onclick = iniciarVinculo;
  }
}
async function iniciarVinculo(){
  const p = $('#muroPaso');
  p.innerHTML = '<div class="esperando">Generando tu código…</div>';
  const j = await api('vincular', { method: 'POST', body: JSON.stringify({ accion: 'iniciar' }) });
  if (j.status !== 200) { p.innerHTML = `<p class="aviso">${esc(j.error || 'No pudimos generar el código. Probá de nuevo.')}</p>`; return; }
  p.innerHTML = `<p class="aviso" style="color:var(--txt2)">Tu cuenta es tu número de WhatsApp. Enviale este código a Vera desde tu celular para vincular este navegador:</p>
    <div class="codigo"><small>TU CÓDIGO · VENCE EN 15 MINUTOS</small><b>${esc(j.codigo)}</b></div>
    <div class="fila-b"><a class="btn btn-p" href="${esc(j.whatsapp)}" target="_blank" rel="noopener">Enviar el código por WhatsApp</a></div>
    <div class="esperando" id="esperaVinc">Esperando la confirmación de WhatsApp…</div>`;
  pararSondeo();
  const fin = Date.now() + 15 * 60 * 1000;
  sondeo = setInterval(async () => {
    if (Date.now() > fin) { pararSondeo(); $('#esperaVinc').textContent = 'El código venció. Pedí uno nuevo.'; return; }
    const r = await api('vincular?codigo=' + encodeURIComponent(j.codigo));
    if (r.status === 200 && r.vinculado) {
      pararSondeo();
      await cargarEstado();
      if (est.suscripto) { cerrarMuro(); aviso('Listo: tu plan Protección está activo en la web.'); }
      else { pasoMuro(); aviso('Tu WhatsApp quedó vinculado.'); }
    } else if (r.status === 410 || r.status === 403) { pararSondeo(); $('#esperaVinc').textContent = r.error || 'El código venció. Pedí uno nuevo.'; }
  }, 3000);
}
function abrirMuro(modo){
  $('#muroEyebrow').textContent = modo === 'vincular' ? 'VINCULÁ TU WHATSAPP' : (est.restantes > 0 ? 'PLAN PROTECCIÓN' : 'USASTE TUS 2 CONSULTAS GRATIS');
  $('#muro').hidden = false;
  if (modo === 'vincular' && !est.vinculado) iniciarVinculo(); else pasoMuro();
}
function cerrarMuro(){ $('#muro').hidden = true; pararSondeo(); }
$('#muroCerrar').addEventListener('click', cerrarMuro);
$('#muro').addEventListener('click', e => { if (e.target.id === 'muro') cerrarMuro(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#muro').hidden) cerrarMuro(); });
document.querySelectorAll('[data-suscribir]').forEach(b => b.addEventListener('click', () => abrirMuro()));
let tAviso;
function aviso(t){ const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(() => el.hidden = true, 3600); }

// ================== Vitrina: celular ==================
// Cada ejemplo: quién escribe, el mensaje (las partes marcadas son las señales) y el veredicto.
const ESCENAS = [
  { de:'+54 9 11 2345-6789', sub:'No está en tus contactos', av:'?', partes:['PAMI informa: su credencial vence ', {t:'hoy', f:'Urgencia para que no lo pienses'}, '. Actualice sus datos para no perder la cobertura: ', {t:'pami-tramites.online', f:'Link falso: no es pami.org.ar', lnk:1}],
    extra:'Se hace pasar por PAMI', p:94, tit:'Estafa: phishing de PAMI', mod:'#1 del Observatorio este mes' },
  { de:'Mamá (número nuevo)', sub:'en línea', av:'M', partes:['Hola hija, cambié de número. ', {t:'Te mandé un código de 6 dígitos por error', f:'Pide un código: así roban tu WhatsApp'}, ', ', {t:'¿me lo reenviás?', f:'Quiere que se lo reenvíes'}],
    extra:'Escribe desde un número nuevo', p:96, tit:'Estafa: robo de cuenta de WhatsApp', mod:'Secuestro de cuenta de WhatsApp' },
  { de:'+234 803 555 1234', sub:'Número internacional', av:'+', partes:['Invertí $50.000 y recibí ', {t:'$400.000 en 7 días', f:'Ganancia imposible: 700 % en una semana'}, '. ', {t:'Cupos limitados', f:'Presión para que decidas rápido'}, ', escribime ya.'],
    extra:'Prefijo +234, frecuente en estafas', p:91, tit:'Estafa: inversión falsa', mod:'#2 del Observatorio este mes' }
];
let escena = 0, celVivo = true;
const pausa = ms => new Promise(r => setTimeout(r, ms));
function armarBurbuja(e){
  return e.partes.map((x, i) => typeof x === 'string' ? esc(x) : `<span class="s${x.lnk ? ' lnk' : ''}" data-i="${i}">${esc(x.t)}</span>`).join('') + '<time>11:42</time><div class="barrido"></div>';
}
function pista(){ $('#celPista').innerHTML = ESCENAS.map((_, i) => `<i class="${i === escena ? 'on' : ''}"></i>`).join(''); }
async function correrEscena(){
  const e = ESCENAS[escena], msg = $('#celMsg'), hall = $('#celHall'), ver = $('#celVer'), est = $('#celEstado');
  pista();
  ver.classList.remove('ve'); hall.innerHTML = ''; est.textContent = ''; msg.classList.remove('ve', 'escaneando');
  await pausa(450);
  $('#celDe').textContent = e.de; $('#celSub').textContent = e.sub; $('#celAv').textContent = e.av;
  msg.innerHTML = armarBurbuja(e);
  msg.classList.add('ve');
  await pausa(1300);
  est.textContent = 'Vera está analizando…';
  msg.classList.add('escaneando');
  await pausa(1300);
  msg.classList.remove('escaneando');
  const marcas = e.partes.filter(x => typeof x !== 'string');
  let n = 0;
  for (const x of marcas) {
    msg.querySelector(`[data-i="${e.partes.indexOf(x)}"]`).classList.add('on');
    hall.insertAdjacentHTML('beforeend', `<span><i>${++n}</i>${esc(x.f)}</span>`);
    await pausa(750);
  }
  hall.insertAdjacentHTML('beforeend', `<span><i>${++n}</i>${esc(e.extra)}</span>`);
  await pausa(600);
  est.textContent = '';
  ver.innerHTML = `<div class="sello">${e.p}</div><div style="min-width:0"><span class="de">RIESGO ALTO · VERA</span><b>${esc(e.tit)}</b><small>${esc(e.mod)} · No respondas</small></div>`;
  ver.classList.add('ve');
}
async function bucleCel(){
  while (true) {
    if (celVivo && !document.hidden) { await correrEscena(); await pausa(3600); escena = (escena + 1) % ESCENAS.length; }
    else await pausa(500);
  }
}
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducir) {
  // Sin animación: se muestra el primer ejemplo ya analizado.
  const e = ESCENAS[0];
  $('#celDe').textContent = e.de; $('#celSub').textContent = e.sub; $('#celAv').textContent = e.av;
  $('#celMsg').innerHTML = armarBurbuja(e); $('#celMsg').classList.add('ve');
  $('#celMsg').querySelectorAll('.s').forEach(x => x.classList.add('on'));
  $('#celHall').innerHTML = e.partes.filter(x => typeof x !== 'string').map((x, i) => `<span><i>${i + 1}</i>${esc(x.f)}</span>`).join('');
  $('#celVer').innerHTML = `<div class="sello">${e.p}</div><div><span class="de">RIESGO ALTO · VERA</span><b>${esc(e.tit)}</b><small>${esc(e.mod)}</small></div>`;
  $('#celVer').classList.add('ve'); pista();
} else bucleCel();

// Inicio
elegirTipo('link'); elegirTipoChat('link'); pintarCupo(); cargarEstado();
const hash = location.hash.slice(1); if (['verificar','como','vivo','planes'].includes(hash)) abrirTab(hash);
})();
