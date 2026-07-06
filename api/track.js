export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    if (req.method === 'POST') {
        try {
            const eventData = req.body;
            eventData.timestamp = new Date().toISOString();
            
            // Si buscás centralizar alertas, desde acá mismo podrías disparar 
            // un webhook por API directamente hacia una instancia de n8n.
            
            // Guardamos el evento en Vercel KV usando la API REST (sin dependencias)
            const url = `${process.env.KV_REST_API_URL}/lpush/cyber_events`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}` },
                body: JSON.stringify([JSON.stringify(eventData)])
            });
            
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Error interno' });
        }
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
