# Reel "grabación de pantalla" (pedido del dueño, 19/10)

Plantilla para piezas que parezcan grabadas de un celular real: pantalla de Android con barra de estado y punto de grabación, dedo que se mueve, zooms, sacudida y flash rojo en cada señal, captura de pantalla, notificación de Vera y chat en modo claro.

- `plantilla.html`: toda la animación es una función `render(t)` (t en segundos). Los tiempos de cámara están en `K`, los títulos en `TITS` y los golpes (sacudida + flash) en `HITS`. `?canal=wa` cambia el cierre; `?limpio=1` saca títulos y dedo (para historias).
- `frames.mjs <carpeta> <canal> <salida> <desde> <hasta>`: cuadros a 30 fps (690 para 23 s). Se puede partir en varios procesos.
- `sfx.py`: efectos de sonido sintetizados (toques, golpes, captura, notificación) en `sfx.wav`.
- Armado: `ffmpeg -framerate 30 -i f%04d.jpg -i sfx.wav -c:v libx264 -pix_fmt yuv420p -crf 24 -c:a aac -t 23 reel.mp4`.
Primer uso: `redes/2026-10-19/` (app falsa dentro de la tienda).

## Grabación de la web real (`web/`, 20 y 21/10)
- `server.mjs`: sirve el repo (con `/agente` y las fichas `/observatorio/<slug>` armadas por `api/estafa.js`) y la composición en `/comp/`. Correrlo desde la raíz del repo (`cd /home/user/Cyber-Mobile && node scripts/redes/grabacion/web/server.mjs`); escucha en 127.0.0.1:8099 y sirve `/comp/` desde su propia carpeta.
- `comp.html`: pantalla de celular 1080x1920 (barra de estado con punto de grabación, barra del navegador con el dominio) con la web real en iframes de 360 px a escala 3. `render(t)` hace el scroll real, los zooms, los toques, los textos y el cierre por canal (`?canal=ig|wa|tt`). Cada pieza es un `diaN.js` (escenas, scroll por selector, cámara, toques, títulos, rótulos de recreación).
- `rec.mjs <dia> <canal> <carpeta> [tiempos] [desde] [hasta]`: graba con reloj falso de Playwright (la web anima al ritmo del video), responde `/api/agente/*` con una consulta de ejemplo (rotularla "Recreación") y saca un cuadro por frame. Con tiempos separados por coma saca solo esos cuadros para revisar.
- `sfx2.py <dia> <dur> <salida>`: efectos; `placa.mjs` arma portadas e historias sobre un cuadro.
- Ojo: no usar `pkill -f` con palabras que aparezcan en el propio comando (mata la shell).
