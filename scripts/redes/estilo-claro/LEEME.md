# Estilo claro (plan de redes del 16/10)

Plantillas de referencia para las piezas nuevas: fondo crema, chats de WhatsApp en modo claro, notas blancas y Vera respondiendo con el semáforo.

- `carrusel-juego.html` + `render-carrusel.mjs`: carrusel "Este mensaje tiene 5 trampas" (1080x1350, 7 placas + historia 1080x1920). `node render-carrusel.mjs <carpeta-de-la-plantilla>`.
- `reel-pov.html` + `render-reel.mjs` + `video.py`: reel "POV: a tu vieja le llega este mensaje" (1080x1920, 23 s). `video.py` arma el video con transiciones lentas y duración exacta.

Las plantillas cargan las fuentes y el logo con rutas absolutas del repo (`/home/user/Cyber-Mobile/...`). Para una pieza nueva: copiar la plantilla al scratchpad, cambiar el contenido, renderizar y revisar las imágenes antes de publicar.
