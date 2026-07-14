import Redis from 'ioredis';

let redisClient;
function getRedisClient() {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL);
    }
    return redisClient;
}

export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        try {
            const eventData = req.body;
            eventData.timestamp = new Date().toISOString();

            const redis = getRedisClient();
            await redis.lpush('cyber_events', JSON.stringify(eventData));

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error en track.js:', error.message);
            return res.status(500).json({ error: 'Error interno' });
        }
    }
    return res.status(405).json({ error: 'Método no permitido' });
}
