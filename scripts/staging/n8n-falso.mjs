// "Vera falsa" para el staging: imita el webhook de n8n del agente web, pero NO toca WhatsApp,
// Gemini ni Mercado Pago. Devuelve siempre un resultado de ejemplo, para que la web funcione
// durante el análisis de seguridad sin gastar nada ni mandar mensajes reales.
import http from 'node:http';

const PUERTO = Number(process.env.PORT || 5699);

const RESPUESTA = {
    acceso: 'ok',
    nivel: 'alto',
    puntaje: 90,
    titulo: 'Ejemplo de staging: posible estafa',
    resumen: 'Respuesta de prueba del n8n falso. Acá iría el análisis real de Vera. No se consultó ningún servicio externo.',
    hallazgos: [
        { tipo: 'peligro', texto: 'Dominio creado hace pocos días (ejemplo)' },
        { tipo: 'alerta', texto: 'Pide datos personales (ejemplo)' }
    ],
    pasos: ['No cargues tus datos.', 'Cerrá la pestaña.'],
    modalidad: { nombre: 'Phishing bancario', slug: 'phishing-banco' },
    estadoSuscripcion: 'sin_suscripcion'
};

http.createServer(async (req, res) => {
    const trozos = [];
    for await (const t of req) { trozos.push(t); if (Buffer.concat(trozos).length > 8 * 1024 * 1024) break; }
    console.log(new Date().toISOString(), req.method, req.url, 'firma:', Boolean(req.headers['x-cm-signature']));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(RESPUESTA));
}).listen(PUERTO, () => console.log(`n8n falso (Vera de prueba) en http://localhost:${PUERTO}`));
