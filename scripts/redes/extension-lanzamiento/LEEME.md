# Reel de lanzamiento de la extensión (25/10)
Plantilla del reel `redes/2026-10-27/reel-extension/`: gancho del caso de la página falsa primera en Google, navegador con clic derecho y Vera (pantallas reales de la 1.1), paso a paso para agregarla y cierre con CTA por canal.
- `node ../por-dentro/rec.mjs $PWD/pieza.html <ig|wa|tt> <carpeta> 0 900` (necesita `logo-cm.png` al lado: copiarlo de la raíz).
- `python3 sfx.py` arma `sfx.wav`; después `ffmpeg -framerate 30 -i f%04d.jpg -i sfx.wav -c:v libx264 -pix_fmt yuv420p -crf 23 -c:a aac -t 30 reel.mp4`.
