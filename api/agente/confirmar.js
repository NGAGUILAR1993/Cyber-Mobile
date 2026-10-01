// n8n confirma que un número de WhatsApp envió "Vincular web CM-XXXXXX".
// Pedido firmado con HMAC (mismas cabeceras que usa Vercel hacia n8n).
// Cuerpo: { "codigo": "CM-XXXXXX", "telefono": "5493510000000", "estado": "activo|prueba|staff|..." }
import { redis, responder, firmaValida, codigoValido, guardarEstado } from '../_lib/agente.js';

async function leerCrudo(req) {
    let t = '';
    for await (const parte of req) { t += parte; if (t.length > 4096) throw new Error('grande'); }
    return t;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return responder(res, 405, { error: 'Método no permitido' }); }
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
