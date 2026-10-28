# Imagen del staging de Cyber Mobile (web + n8n falso). Solo para análisis de seguridad local.
FROM node:22-slim

WORKDIR /app
# Dependencias (ioredis para los contadores, @vercel/og para las tarjetas).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# El resto del repo se monta como volumen de solo lectura en docker-compose (no se copia acá),
# así el análisis siempre usa tu código actual sin reconstruir la imagen.
EXPOSE 8080 5699
CMD ["node", "scripts/staging/servidor.mjs"]
