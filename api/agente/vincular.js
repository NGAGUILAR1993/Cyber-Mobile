// Vincular el navegador con el WhatsApp de la persona, sin contraseñas:
//  1. POST { accion: 'iniciar' } -> código CM-XXXXXX y link de WhatsApp con el texto listo.
//  2. La persona lo envía al agente; n8n lo confirma en /api/agente/confirmar.
//  3. GET ?codigo=CM-XXXXXX -> cuando n8n confirmó, la sesión queda con su número.
//  POST { accion: 'salir' } desvincula este navegador.
import {
    redis, configurado, responder, origenPermitido, sesionOCrear, guardarSesion, nuevoCodigo, codigoValido,
    guardarEstado, telefonoOculto, ESTADOS_CON_ACCESO, WA_AGENTE, excedeLimite, ipDe
} from '../_lib/agente.js';

const VIGENCIA = 15 * 60;

export default async function handler(req, res) {
    if (!origenPermitido(req)) return responder(res, 403, { error: 'Origen no permitido' });
    if (!configurado()) return responder(res, 503, { codigo: 'no_configurado', error: 'La vinculación todavía no está disponible.' });
    const r = redis();
    const s = sesionOCrear(req, res);
    try {
        if (req.method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
            const accion = body && body.accion;
            if (accion === 'salir') {
                guardarSesion(res, { id: s.id, tel: '' });
                return responder(res, 200, { vinculado: false });
            }
            if (accion !== 'iniciar') return responder(res, 400, { error: 'Acción no válida.' });
            if (await excedeLimite(r, 'vinc:' + ipDe(req), [{ ventana: 3600, max: 10 }])) {
                return responder(res, 429, { error: 'Pediste muchos códigos. Esperá un rato.' });
            }
            const codigo = nuevoCodigo();
            await r.set(`cm_agente:vinc:${codigo}`, s.id, 'EX', VIGENCIA);
            const texto = `Vincular web ${codigo}`;
            return responder(res, 200, { codigo, texto, whatsapp: `https://wa.me/${WA_AGENTE}?text=${encodeURIComponent(texto)}`, vence: VIGENCIA });
        }
        if (req.method === 'GET') {
            const codigo = String(req.query?.codigo || new URL(req.url, 'http://x').searchParams.get('codigo') || '').toUpperCase();
            if (!codigoValido(codigo)) return responder(res, 400, { error: 'Código no válido.' });
            const dueño = await r.get(`cm_agente:vinc:${codigo}`);
            if (!dueño) return responder(res, 410, { codigo: 'vencido', error: 'El código venció. Pedí uno nuevo.' });
            if (dueño !== s.id) return responder(res, 403, { error: 'Este código es de otro navegador.' });
            const ok = await r.get(`cm_agente:vinc_ok:${codigo}`);
            if (!ok) return responder(res, 200, { vinculado: false });
            const { tel, estado } = JSON.parse(ok);
            await r.del(`cm_agente:vinc:${codigo}`, `cm_agente:vinc_ok:${codigo}`);
            await guardarEstado(r, tel, estado);
            guardarSesion(res, { id: s.id, tel });
            return responder(res, 200, { vinculado: true, telefono: telefonoOculto(tel), suscripto: ESTADOS_CON_ACCESO.includes(estado) });
        }
        res.setHeader('Allow', 'GET, POST');
        return responder(res, 405, { error: 'Método no permitido' });
    } catch (e) {
        console.error('agente/vincular:', e.message);
        return responder(res, 503, { error: 'No pudimos vincular tu WhatsApp. Probá de nuevo en un rato.' });
    }
}
