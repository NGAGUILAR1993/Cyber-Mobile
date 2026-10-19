# Reel "grabación de pantalla" (pedido del dueño, 19/10)

Plantilla para piezas que parezcan grabadas de un celular real: pantalla de Android con barra de estado y punto de grabación, dedo que se mueve, zooms, sacudida y flash rojo en cada señal, captura de pantalla, notificación de Vera y chat en modo claro.

- `plantilla.html`: toda la animación es una función `render(t)` (t en segundos). Los tiempos de cámara están en `K`, los títulos en `TITS` y los golpes (sacudida + flash) en `HITS`. `?canal=wa` cambia el cierre; `?limpio=1` saca títulos y dedo (para historias).
- `frames.mjs <carpeta> <canal> <salida> <desde> <hasta>`: cuadros a 30 fps (690 para 23 s). Se puede partir en varios procesos.
- `sfx.py`: efectos de sonido sintetizados (toques, golpes, captura, notificación) en `sfx.wav`.
- Armado: `ffmpeg -framerate 30 -i f%04d.jpg -i sfx.wav -c:v libx264 -pix_fmt yuv420p -crf 24 -c:a aac -t 23 reel.mp4`.
Primer uso: `redes/2026-10-19/` (app falsa dentro de la tienda).
