// n8n confirma que un número de WhatsApp envió "Vincular web CM-XXXXXX".
// Pedido firmado con HMAC (mismas cabeceras que usa Vercel hacia n8n).
// Cuerpo: { "codigo": "CM-XXXXXX", "telefono": "5493510000000", "estado": "activo|prueba|staff|..." }
import crypto from 'node:crypto';
import { redis, responder, firmaValida, codigoValido, guardarEstado } from '../_lib/agente.js';

async function leerCrudo(req, max = 4096) {
    let t = '';
    for await (const parte of req) { t += parte; if (t.length > max) throw new Error('grande'); }
    return t;
}

// ---------- Aviso de pago de Polar (suscripciones internacionales de la extensión) ----------
// Polar firma con Standard Webhooks: HMAC-SHA256 de "<webhook-id>.<webhook-timestamp>.<cuerpo>" en base64.
// El secreto (POLAR_WEBHOOK_SECRET, variable de Vercel) es el que muestra Polar al crear el endpoint.
function firmaPolarValida(req, crudo) {
    const secreto = String(process.env.POLAR_WEBHOOK_SECRET || '');
    const id = String(req.headers['webhook-id'] || ''), ts = String(req.headers['webhook-timestamp'] || '');
    const firmas = String(req.headers['webhook-signature'] || '').split(' ').map((x) => x.split(',')[1]).filter(Boolean);
    if (!secreto || !id || !/^\d{9,11}$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > 300 || !firmas.length) return false;
    const claves = [Buffer.from(secreto, 'utf8')];
    try { claves.push(Buffer.from(secreto.replace(/^whsec_/, ''), 'base64')); } catch { /* sin segunda forma */ }
    for (const clave of claves) {
        const esperada = crypto.createHmac('sha256', clave).update(`${id}.${ts}.${crudo}`).digest('base64');
        if (firmas.some((f) => f.length === esperada.length && crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperada)))) return true;
    }
    return false;
}
async function avisoPolar(req, res) {
    let crudo;
    try { crudo = await leerCrudo(req, 262144); } catch { return responder(res, 413, { error: 'Pedido inválido.' }); }
    if (!firmaPolarValida(req, crudo)) return responder(res, 401, { error: 'Firma inválida.' });
    let ev;
    try { ev = JSON.parse(crudo); } catch { return responder(res, 400, { error: 'Pedido inválido.' }); }
    const tipo = String(ev.type || ''), d = ev.data || {};
    const ref = String((d.metadata && d.metadata.reference_id) || (d.subscription && d.subscription.metadata && d.subscription.metadata.reference_id) || '');
    if (!/^[a-f0-9]{32}$/.test(ref)) return responder(res, 200, { ok: true, ignorado: 'sin referencia' });   // pago que no viene de la extensión
    const clave = `cm_agente:pago:${ref}`;
    try {
        const r = redis();
        if (tipo.startsWith('subscription.')) {
            const vigente = ['active', 'trialing'].includes(String(d.status || ''));
            if (!vigente) { await r.del(clave); return responder(res, 200, { ok: true, estado: 'fin' }); }
            // Acceso hasta el fin del período pagado (+3 días de gracia). Cancelada = sigue hasta ese día.
            const fin = Date.parse(d.current_period_end || '');
            const seg = Number.isFinite(fin) ? Math.max(86400, Math.min(400 * 86400, Math.round((fin - Date.now()) / 1000) + 3 * 86400)) : 35 * 86400;
            await r.set(clave, 'activo', 'EX', seg);
            return responder(res, 200, { ok: true, estado: 'activo' });
        }
        if (tipo === 'order.paid') {
            await r.set(clave, 'activo', 'EX', 35 * 86400);
            return responder(res, 200, { ok: true, estado: 'activo' });
        }
        return responder(res, 200, { ok: true, ignorado: tipo });
    } catch (e) {
        console.error('agente/confirmar (polar):', e.message);
        return responder(res, 503, { ok: false });   // Polar reintenta
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return responder(res, 405, { error: 'Método no permitido' }); }
    if (req.query && req.query.via === 'polar') return avisoPolar(req, res);
    let crudo;
    try { crudo = await leerCrudo(req); } catch { return responder(res, 413, { error: 'Pedido inválido.' }); }
    if (!firmaValida(req, crudo)) return responder(res, 401, { error: 'Firma inválida.' });
    let b;
    try { b = JSON.parse(crudo); } catch { return responder(res, 400, { error: 'Pedido inválido.' }); }
    const codigo = String(b.codigo || '').toUpperCase();
    const tel = String(b.telefono || '').replace(/\D/g, '');
    if (!codigoValido(codigo) || !/^\d{10,15}$/.test(tel)) return responder(res, 400, { error: 'Datos inválidos.' });
    try {
        const r = redis();
        const dueño = await r.get(`cm_agente:vinc:${codigo}`);
        if (!dueño) return responder(res, 404, { ok: false, codigo: 'vencido' });
        const estado = String(b.estado || '').toLowerCase().slice(0, 20);
        await r.set(`cm_agente:vinc_ok:${codigo}`, JSON.stringify({ tel, estado }), 'EX', 15 * 60);
        await guardarEstado(r, tel, estado);
        return responder(res, 200, { ok: true });
    } catch (e) {
        console.error('agente/confirmar:', e.message);
        return responder(res, 503, { ok: false });
    }
}
