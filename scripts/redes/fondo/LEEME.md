# Fondo antiestafas (carrusel del 24/10)
Plantilla del carrusel `redes/2026-10-24/`: un fondo de pantalla con 4 reglas para la pantalla bloqueada y el carrusel que lo explica, en la paleta violeta, cian y rosa de "Por dentro".
- Las reglas viven en `REG` y el porqué de cada una en `WHY` (`pieza.html`). Salen del ranking del mes de `observatorio/datos.json`: al cambiar el mes, actualizar reglas, la lista de la placa 3 y la fecha del pie.
- `node render.mjs <carpeta>` arma `fondo.jpg` (1080x2340), `carrusel-1..9.jpg` (1080x1350) e `historia.jpg` (1080x1920). `visa.jpg` es la captura del caso real con los datos ya tapados (copia de `rayos-x/visa.jpg`).
