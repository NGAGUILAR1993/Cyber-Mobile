import Redis from 'ioredis';

let redisClient;
function getRedisClient() {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL);
    }
    return redisClient;
}

export default async function handler(req, res) {
    // Capa de autenticación básica
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ error: 'Acceso denegado' });
    }

    if (req.method === 'GET') {
        try {
            const redis = getRedisClient();
            // Traer los últimos 1000 eventos de la base de datos
            const rawItems = await redis.lrange('cyber_events', 0, 1000);
            const parsedData = rawItems.map(item => JSON.parse(item));

            return res.status(200).json(parsedData);
        } catch (error) {
            console.error('Error en stats.js:', error.message);
            return res.status(500).json({ error: 'Error leyendo datos' });
        }
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
