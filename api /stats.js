export default async function handler(req, res) {
    // Capa de autenticación básica
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Acceso denegado' });
    }
    
    if (req.method === 'GET') {
        try {
            // Traer los últimos 1000 eventos de la base de datos
            const url = `${process.env.KV_REST_API_URL}/lrange/cyber_events/0/1000`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}` }
            });
            
            const data = await response.json();
            // Redis devuelve strings, los parseamos a JSON
            const parsedData = (data.result || []).map(item => JSON.parse(item));
            
            return res.status(200).json(parsedData);
        } catch (error) {
            return res.status(500).json({ error: 'Error leyendo datos' });
        }
    }
}
