# Reel "La notificación" (28/10, promoción paga)
- `node rec.mjs $PWD/pieza.html <carpeta> 0 900` (o tiempos separados por coma para probar).
- `python3 sfx.py` -> sfx.wav; `ffmpeg -framerate 30 -i <carpeta>/f%04d.jpg -i sfx.wav -c:v libx264 -preset slow -pix_fmt yuv420p -crf 25 -maxrate 1.6M -bufsize 3.2M -c:a aac -t 30 reel.mp4`.
- Imágenes: capturas reales de scripts/redes/casos/ (visa-falso.jpg con el cuerpo del mail desenfocado), extension-lanzamiento/ y agente-web.png (la /agente del repo renderizada a 412 px).
