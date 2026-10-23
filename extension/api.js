// Conexión con Vera (la misma API que usa cybermobile.com.ar/agente).
// La sesión es un token firmado por el servidor que guardamos en el almacenamiento de la extensión:
// sirve para contar las 3 consultas gratis y para recordar el WhatsApp vinculado.
export const BASE = 'https://www.cybermobile.com.ar';
const API = BASE + '/api/agente';

async function token() {
    const { sesion } = await chrome.storage.local.get('sesion');
    return typeof sesion === 'string' ? sesion : '';
}
async function guardarToken(datos) {
    if (datos && typeof datos.sesion === 'string' && datos.sesion.length < 600) await chrome.storage.local.set({ sesion: datos.sesion });
}

async function pedir(ruta, opciones = {}) {
    const t = await token();
    const headers = { Accept: 'application/json', 'X-CM-Canal': 'extension', ...(opciones.headers || {}) };
    if (t) headers['X-CM-Sesion'] = t;
    let resp;
    try {
        resp = await fetch(API + ruta, { ...opciones, headers, credentials: 'omit', cache: 'no-store' });
    } catch {
        return { status: 0, datos: { error: 'No hay conexión. Revisá internet y probá de nuevo.' } };
    }
    let datos = {};
    try { datos = await resp.json(); } catch { datos = { error: 'Vera no respondió bien. Probá de nuevo en un rato.' }; }
    await guardarToken(datos);
    return { status: resp.status, datos };
}

export const estado = () => pedir('/estado');

export function consultar(consulta) {
    return pedir('/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consulta)
    });
}

export function vincularIniciar() {
    return pedir('/vincular', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'iniciar' }) });
}
export const vincularEstado = (codigo) => pedir('/vincular?codigo=' + encodeURIComponent(codigo));
export function desvincular() {
    return pedir('/vincular', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'salir' }) });
}

// Adivina qué es lo que la persona pegó o seleccionó.
export function detectar(texto) {
    const v = String(texto || '').trim();
    const sinEsp = v.replace(/[\s-]/g, '');
    if (/^\d{22}$/.test(sinEsp)) return { tipo: 'cbu', valor: sinEsp };
    if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return { tipo: 'email', valor: v };
    if (/^\+?[\d\s().-]{8,20}$/.test(v) && v.replace(/\D/g, '').length >= 8) return { tipo: 'tel', valor: v };
    if (/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v) && !/\s/.test(v)) return { tipo: 'link', valor: v };
    if (/^[a-z0-9]+(\.[a-z0-9]+){1,3}$/i.test(v) && v.length >= 6 && v.length <= 20 && !/\.(com|ar|net|org)$/i.test(v)) return { tipo: 'cbu', valor: v.toLowerCase() };   // alias
    return { tipo: 'mensaje', valor: v };
}
