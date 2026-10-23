// Panel de Vera: el mismo archivo sirve para la ventanita del ícono y para la ventana que abre el clic derecho.
import { BASE, estado, consultar, vincularIniciar, vincularEstado, desvincular, detectar } from './api.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const VISTAS = ['inicio', 'cargando', 'resultado', 'pago', 'vincular'];
const WA_SUSCRIBIR = 'https://wa.me/5491170598505?text=' + encodeURIComponent('Hola Vera, quiero suscribirme (vengo de la extensión de Chrome)');
let tabActual = null, ultimo = null, sondeo = 0;

function mostrar(v) {
    VISTAS.forEach((n) => { $('vista-' + n).hidden = n !== v; });
    $('error').hidden = true;
}
function error(t) { $('error').textContent = t; $('error').hidden = false; }
const abrir = (url) => chrome.tabs.create({ url });

// ---------- Estado de la cuenta (cupo y WhatsApp vinculado) ----------
async function pintarEstado() {
    const { status, datos } = await estado();
    if (status !== 200) return;
    const cupo = $('cupo');
    cupo.hidden = false;
    cupo.classList.toggle('pro', Boolean(datos.suscripto));
    cupo.textContent = datos.suscripto ? 'Suscripción activa' : `${datos.restantes} de ${datos.gratis} gratis`;
    const pie = $('pie-cuenta');
    pie.textContent = '';
    if (datos.vinculado) {
        pie.append('WhatsApp ' + datos.telefono + ' · ');
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = 'Desvincular';
        b.onclick = async () => { await desvincular(); pintarEstado(); };
        pie.append(b);
    } else {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = '¿Ya sos cliente? Vinculá tu WhatsApp';
        b.onclick = iniciarVinculo;
        pie.append(b);
    }
}

// ---------- Consulta ----------
async function verificar(consulta) {
    if (!consulta || (!consulta.valor && !consulta.archivo)) return error('Pegá algo para verificar.');
    ultimo = consulta;
    $('cargando-txt').textContent = consulta.tipo === 'archivo' ? 'Vera está mirando la imagen o el archivo…' : 'Vera lo está analizando…';
    mostrar('cargando');
    const { status, datos } = await consultar(consulta);
    pintarEstado();
    if (status === 200 && datos.resultado) return pintarResultado(datos.resultado);
    if (status === 402) return mostrar('pago');
    if (status === 409 && datos.codigo === 'solo_whatsapp') { mostrar('inicio'); return error('Los audios se analizan por WhatsApp: reenviáselo a Vera al +54 9 11 7059-8505.'); }
    mostrar('inicio');
    error(datos.error || 'No pude completar el análisis. Probá de nuevo en un rato.');
}

const NIVELES = { alto: 'Riesgo alto', medio: 'Precaución', bajo: 'Sin señales de riesgo', desconocido: 'Sin datos suficientes' };
function pintarResultado(r) {
    const res = $('res');
    res.className = 'res ' + (NIVELES[r.nivel] ? r.nivel : 'desconocido');
    $('r-nivel').textContent = NIVELES[r.nivel] || NIVELES.desconocido;
    $('r-titulo').textContent = r.titulo || '';
    $('r-resumen').textContent = r.resumen || '';
    const ul = $('r-hallazgos'); ul.textContent = '';
    (r.hallazgos || []).forEach((h) => { const li = document.createElement('li'); li.className = h.tipo; li.textContent = h.texto; ul.append(li); });
    const ol = $('r-pasos'); ol.textContent = '';
    (r.pasos || []).forEach((p) => { const li = document.createElement('li'); li.textContent = p; ol.append(li); });
    $('r-pasos-box').hidden = !(r.pasos || []).length;
    const m = $('r-modalidad');
    if (r.modalidad && /^[a-z0-9-]{3,60}$/.test(r.modalidad.slug || '')) {
        m.href = `${BASE}/observatorio/${r.modalidad.slug}`;
        m.textContent = `Ver cómo funciona "${r.modalidad.nombre}" en el Observatorio →`;
        m.hidden = false;
    } else m.hidden = true;
    mostrar('resultado');
}

// ---------- Archivos y captura ----------
function leerArchivo(f) {
    return new Promise((ok, mal) => {
        if (f.size > 3 * 1024 * 1024) return mal(new Error('El archivo supera los 3 MB.'));
        const fr = new FileReader();
        fr.onload = () => { const d = String(fr.result); ok({ nombre: f.name, mime: f.type || 'application/octet-stream', datos: d.slice(d.indexOf(',') + 1) }); };
        fr.onerror = () => mal(new Error('No pude leer el archivo.'));
        fr.readAsDataURL(f);
    });
}
async function capturarPantalla() {
    try {
        const d = await chrome.tabs.captureVisibleTab(tabActual ? tabActual.windowId : undefined, { format: 'jpeg', quality: 70 });
        verificar({ tipo: 'archivo', archivo: { nombre: 'captura.jpg', mime: 'image/jpeg', datos: d.slice(d.indexOf(',') + 1) } });
    } catch {
        error('No pude sacar la captura de esta pestaña. Probá en una página web común.');
    }
}

// ---------- Vincular WhatsApp ----------
async function iniciarVinculo() {
    mostrar('vincular');
    $('v-codigo').textContent = '…';
    $('v-estado').textContent = 'Pidiendo el código…';
    const { status, datos } = await vincularIniciar();
    if (status !== 200) { $('v-estado').textContent = datos.error || 'No pude generar el código. Probá de nuevo.'; return; }
    $('v-codigo').textContent = datos.codigo;
    $('v-estado').textContent = 'Esperando el mensaje… (el código vence en 15 minutos)';
    $('b-enviar-codigo').onclick = () => abrir(datos.whatsapp);
    clearInterval(sondeo);
    const fin = Date.now() + datos.vence * 1000;
    sondeo = setInterval(async () => {
        if (Date.now() > fin) { clearInterval(sondeo); $('v-estado').textContent = 'El código venció. Volvé a intentarlo.'; return; }
        const r = await vincularEstado(datos.codigo);
        if (r.status === 200 && r.datos.vinculado) {
            clearInterval(sondeo);
            $('v-estado').textContent = r.datos.suscripto ? '¡Listo! Tu suscripción ya funciona en el navegador.' : 'WhatsApp vinculado. Todavía no vemos una suscripción activa en ese número.';
            pintarEstado();
            setTimeout(() => mostrar('inicio'), 2500);
        } else if (r.status >= 400) { clearInterval(sondeo); $('v-estado').textContent = r.datos.error || 'No pude confirmar la vinculación.'; }
    }, 3000);
}

// ---------- Arranque ----------
$('b-verificar').onclick = () => {
    const t = $('texto').value.trim();
    if (!t) return error('Pegá algo para verificar.');
    verificar(detectar(t));
};
$('texto').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('b-verificar').click(); });
$('archivo').onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try { verificar({ tipo: 'archivo', archivo: await leerArchivo(f) }); } catch (err) { error(err.message); }
};
$('b-pagina').onclick = () => tabActual && verificar({ tipo: 'link', valor: tabActual.url });
$('b-pantalla').onclick = capturarPantalla;
$('b-otra').onclick = () => { $('texto').value = ''; mostrar('inicio'); };
$('b-suscribir').onclick = () => abrir(WA_SUSCRIBIR);
$('b-ya-soy').onclick = iniciarVinculo;
$('b-volver').onclick = () => { clearInterval(sondeo); mostrar(ultimo ? 'pago' : 'inicio'); };

(async () => {
    if (params.get('ventana') || params.get('bienvenida')) document.body.classList.add('ventana');
    if (params.get('bienvenida')) $('bienvenida').hidden = false;
    pintarEstado();
    if (params.get('ventana')) {
        const { pendiente } = await chrome.storage.session.get('pendiente');
        await chrome.storage.session.remove('pendiente');
        if (pendiente && pendiente.error) { mostrar('inicio'); return error(pendiente.error); }
        if (pendiente && Date.now() - pendiente.t < 60000) return verificar(pendiente);
        return mostrar('inicio');
    }
    // Ventanita del ícono: ofrecer la página donde está la persona.
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && /^https?:\/\//.test(tab.url || '')) {
            tabActual = tab;
            $('dominio').textContent = new URL(tab.url).hostname;
            $('pagina').hidden = false;
        }
    } catch { /* sin pestaña: solo el cuadro de texto */ }
    mostrar('inicio');
})();
