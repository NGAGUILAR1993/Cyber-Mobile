# Reel "por dentro" (22/10)
Plantilla del reel `redes/2026-10-22/`: celular 3D de la portada, escaneo de color y tarjetas que entran, en la paleta violeta, cian y rosa.
- Cuadros del celular: `fr/gNN.jpg` (72, de `media/vera3d/v2/giro-1080.mp4`) y `fr/eNN.jpg` (36, de `media/vera3d/v2/e-1080/*.webp`), sacados con ffmpeg al lado de `pieza.html`.
- `node rec.mjs <ruta>/pieza.html <ig|wa|tt> <carpeta> <desde> <hasta>` (cuadros a 30 fps; con tiempos separados por coma saca solo esos). `?historia=1` arma la historia.
- `python3 sfx.py` arma `sfx.wav`; después `ffmpeg -framerate 30 -i f%04d.jpg -i sfx.wav -c:v libx264 -pix_fmt yuv420p -crf 23 -c:a aac -t 30 reel.mp4`.
