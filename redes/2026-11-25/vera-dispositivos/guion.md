# Reel 25/11 · "Vera en todos tus dispositivos" · v2 sin personas

30,000 s · 1080x1920 · 30 fps · H.264 a ~10 Mbps + AAC. Germán aprobó el concepto ("Video reel") y después pidió "sin imágenes de personas, mostrá bien las herramientas". Las protagonistas son las 3 herramientas reales: WhatsApp con "Vera AI Antiestafas", la web `/agente` y la extensión de Chrome 1.4. Las consultas son de ejemplo y llevan el rótulo "CONSULTA DE EJEMPLO" todo el tiempo. Mensaje central del cierre (de Germán): "Todo con una sola suscripción, para acompañarte en tu vida digital, en cada momento de tu día".

| Tiempo | Qué pasa | Texto y tiempo legible |
|---|---|---|
| 0,0 – 8,8 | **CELU** (amarillo). El celular sube (0,15–0,9 s); toque en enviar (0,85 s) y entra el mensaje reenviado con `temu-ofertas-ar.shop` (1,0 s); "escribiendo…" (1,6–2,4 s); llega la respuesta de Vera 🔴 (2,4 s); zoom lento al chat (2,7–3,4 s); círculo rojo al dominio (3,9 s), resaltador en las 3 señales (4,7 / 5,25 / 5,8 s); sello "ES ESTAFA." y semáforo en rojo (6,0 s) | "EN TU CELU." todo el tramo · "Te llega un cupón de $150.000 para gastar hoy. ¿Es real?" 0–3,3 s · chat legible 3,4–8,5 s (5,1 s) · sello 2,5 s |
| 8,5 – 9,1 | Barrido turquesa | — |
| 8,8 – 17,3 | **WEB** (turquesa). Entra el monitor con `/agente` (8,9–9,6 s); el texto pegado aparece en la caja (9,9–10,3 s); el cursor va a "Analizar" y hace clic (10,3–11,1 s); pasos del análisis (11,2 s); resultado (11,8 s); zoom lento al veredicto (12,0–12,8 s); círculo al 93 (13,0 s), subrayado del primer hallazgo (13,7 s), sticker "LA PLATA NUNCA ENTRÓ" (14,3 s) | "EN LA WEB." todo el tramo · "Un cliente te pide que le devuelvas $48.000 a otro CBU." 8,8–12,2 s · veredicto legible 12,8–17,0 s (4,2 s) · sticker 2,7 s |
| 17,0 – 17,6 | Barrido verde | — |
| 17,3 – 25,5 | **NAVEGADOR** (verde). Entra la notebook con Chrome en `drive-apuntes-compartidos.site`, la descarga `apuntes_final.zip` abajo y la extensión fijada con aro turquesa (17,4–18,0 s); el cursor hace clic en el ícono (18,5 s) y se abre el panel real; clic en "Subir archivo" (19,2 s); el panel enciende sus herramientas (19,3 s); resultado 🔴 "No lo abras" (19,9 s); zoom al panel (20,0–20,7 s); subrayado del hallazgo `.pdf.exe` (21,2 s); sticker ".PDF.EXE ESCONDIDO" (22,3 s) | "EN TU NAVEGADOR." todo el tramo · "Bajaste los apuntes del final de un link del grupo. ¿Lo abrís?" 17,3–20,2 s · panel legible 20,7–25,2 s (4,5 s) · sticker 2,9 s |
| 25,2 – 25,8 | Barrido negro + impacto | — |
| 25,5 – 30,0 | **CIERRE.** CELU · WEB · NAVEGADOR (25,65 / 25,85 / 26,05 s) → "UNA SOLA SUSCRIPCIÓN." (26,3 s) → "Te acompaña en tu vida digital, en cada momento de tu día." (26,7 s) → "PROBALA 7 DÍAS GRATIS · cybermobile.com.ar/vera" (27,2 s; en TikTok, "LINK EN EL PERFIL · 7 días gratis"). Franjas del semáforo abajo | Lema 3,7 s · frase 3,3 s · CTA 2,8 s |

Revisado a 1 cuadro por segundo, en el video final y en la versión TikTok: todos los textos completos y legibles. Duración: 30,000 s.

## Archivos
- `v.html`: toda la animación (`render(t)`). Mide en el navegador la posición de cada pantalla y hace la cámara con zoom real sobre la captura.
- `pantallas/`: capturas reales de `/agente` y de la extensión (de `scripts/redes/propuestas/2026-11-25-dispositivos/capturas.mjs`).
- `rec.mjs`: graba los cuadros (`node rec.mjs $PWD/v.html ig <dir> 0 900`; con `tt`, el cierre de TikTok).
- `musica.py`: `python3 musica.py musica.wav` (lo-fi house 118 BPM, Re mayor; whoosh en los zooms, clics, sello).
- Codificación: `ffmpeg -framerate 30 -i <dir>/f%04d.jpg -i musica.wav -c:v libx264 -pix_fmt yuv420p -b:v 10M -maxrate 12M -bufsize 20M -c:a aac -b:a 192k -t 30 -movflags +faststart reel.mp4`
