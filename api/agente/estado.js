// Estado del visitante en /agente: consultas gratis que le quedan y si vinculó su WhatsApp.
import { redis, configurado, responder, sesionOCrear, gratisUsadas, estadoSuscripcion, telefonoOculto, tokenSesion, ESTADOS_CON_ACCESO, GRATIS, WA_AGENTE } from '../_lib/agente.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return responder(res, 405, { error: 'Método no permitido' }); }
    if (!configurado()) return responder(res, 200, { configurado: false, gratis: GRATIS, restantes: GRATIS, whatsapp: WA_AGENTE });
    const s = sesionOCrear(req, res);
    try {
        const r = redis();
        const usadas = await gratisUsadas(r, s);
        const estado = await estadoSuscripcion(r, s.tel);
        return responder(res, 200, {
            configurado: true,
            gratis: GRATIS,
            restantes: Math.max(0, GRATIS - usadas),
            vinculado: Boolean(s.tel),
            telefono: telefonoOculto(s.tel),
            suscripto: ESTADOS_CON_ACCESO.includes(estado),
            whatsapp: WA_AGENTE,
            sesion: tokenSesion(s)
        });
    } catch (e) {
        console.error('agente/estado:', e.message);
        return responder(res, 503, { error: 'No pudimos cargar tu estado. Probá de nuevo en un rato.' });
    }
}
