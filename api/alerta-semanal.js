// Datos de la alerta del lunes para n8n: el #1 del ranking del Observatorio en este momento,
// el texto listo para WhatsApp y el link a su tarjeta (/tarjetas/semana-AAAAMMDD.png).
// Es público y de solo lectura: muestra lo mismo que ya está en /observatorio.
import fs from 'node:fs';
import path from 'node:path';
import { alertaSemanal, textoWhatsApp, SITIO } from './_lib/alerta.js';

export default function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido' }); }
    try {
        const leer = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
        let claves = {};
        try { claves = leer('scripts/redes/claves.json'); } catch { /* sin claves */ }
        const a = alertaSemanal(leer('observatorio/datos.json'), claves);
        if (!a) return res.status(404).json({ error: 'Sin ranking' });
        const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
        return res.status(200).json({
            tipo: 'alerta-semanal', fecha, mes: a.mes, slug: a.slug, nombre: a.nombre,
            whatsapp: textoWhatsApp(a),
            ficha: `${SITIO}/observatorio/${a.slug}`,
            imagen: `${SITIO}/tarjetas/semana-${fecha.replace(/-/g, '')}.png`
        });
    } catch (e) {
        console.error('alerta-semanal.js:', e.message);
        return res.status(500).json({ error: 'Error interno' });
    }
}
