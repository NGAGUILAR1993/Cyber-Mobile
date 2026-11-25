# Propuesta Black Friday (vie 27/11) · "Este reloj miente"

**Estado:** PROPUESTA para aprobar. Solo preview (regla 12). No se anima ni se publica nada sin el OK de Germán.
**Preview:** `scripts/redes/propuestas/2026-11-24-black-friday/preview.jpg` (3 cuadros clave, 1080x1920 c/u). Fuente: `p.html` + `shot.mjs`.

## Concepto (2 líneas)
Las tiendas falsas de Black Friday ponen un reloj de "termina en 10 minutos" que se reinicia cada vez que recargás la página: no cuenta nada, es apuro armado para que pagues sin pensar.
Lo mostramos en vivo (recargás, vuelve a 09:59), se lo mandamos a Vera, que la desarma con el semáforo, y cerramos con el dato del Observatorio.

**Por qué es distinta:** todas las cuentas dicen "desconfiá de los precios bajos". Nadie mostró el truco del reloj, que es visual, se entiende en 1 segundo y cualquiera lo puede probar el viernes (recargar la página). Es un consejo que se hace, no que se lee. No repite nada de los últimos 45 días: el 28/10 fue lo que llega **después** de comprar (falsa Aduana); acá es el **momento de pagar**.

## Gancho
- En pantalla (0 s): **"ESTE RELOJ MIENTE."** sobre el reloj gigante que llega a 00:01 y salta a 09:59.
- Línea de apoyo: "$29.999 por 9 minutos. Recargás la página y vuelve a empezar." `hookscore.py`: **58,5 (OK)**. La variante corta "Este reloj miente." da 25 porque el script solo mide marcadores en inglés y números; en pantalla va la corta (impacto) y la línea con número debajo (score).

## Guion cronometrado (30 s, legibilidad regla 1)
| Tiempo | Pantalla | Texto a leer (tiempo en pantalla) | Sonido |
|---|---|---|---|
| 0,0 – 1,0 | Negro `#0b0b0b`. Reloj gigante crema (Anton): 00:03 · 00:02 · 00:01, un número por golpe | — | Tic de reloj como hi-hat |
| 1,0 – 1,6 | ↻ el reloj "rebobina" y queda en **09:59**. Círculo rojo a mano se dibuja alrededor (0,6 s) | — | Rebobinado/scratch |
| 1,4 – 4,5 | Sello **"ESTE RELOJ MIENTE."** (MIENTE en bloque rojo). Debajo: "$29.999 por 9 minutos. Recargás la página y vuelve a empezar." | Titular 3,1 s · línea 2,9 s (aparece a 1,6) | Entra el beat |
| 4,5 – 5,1 | Transición lenta (barrido crema, 0,6 s) | — | — |
| 5,1 – 8,1 | Crema. Mano con el celular: la tienda (recreación, rótulo fijo "RECREACIÓN · TIENDA Y CHAT DE EJEMPLO"). El dedo toca recargar: 00:02 → 09:59. Sticker rojo "SE REINICIA ↻". Arriba: **"NO ES UNA OFERTA. ES APURO ARMADO."** | 3,0 s | Segundo rebobinado |
| 8,1 – 12,1 | Mismo celular, ahora el chat de WhatsApp con **Vera AI Antiestafas** (foto de perfil, "en línea"). Sale el mensaje con la captura de la tienda + "Recargo y el reloj vuelve a 10 minutos. ¿Es real?". Marcas de Vera: círculo rojo al reloj (9,0), subrayado ondulado al dominio `zapas-blackfriday-oficial-outlet.shop` (10,0) | Mensaje 4,0 s | — |
| 12,1 – 12,7 | "escribiendo…" | — | — |
| 12,7 – 18,2 | Respuesta: 🔴 RIESGO ALTO · "Es una tienda falsa. 3 señales": la página se creó hace 6 días / te empuja a transferir a una cuenta personal / el reloj se reinicia: es apuro armado · "✋ No pagues. Buscá la tienda oficial." Resaltador amarillo en cada señal, una por compás | 5,5 s | Golpes del resaltador sobre el compás |
| 18,2 – 21,5 | Rojo pleno. **"ES ESTAFA."** como sello (entra con golpe, leve sacudida). Semáforo de Vera: se enciende el rojo. "EL APURO ES EL ANZUELO" | 3,3 s | Drop en el compás 11 (18,2 s) |
| 21,5 – 25,5 | Bloque negro con sombra amarilla: "OBSERVATORIO DE FRAUDE DIGITAL · NOV 2026 · **TIENDA ONLINE FALSA** · N.º 1 del ranking internacional y en vigilancia en Argentina, justo antes del Black Friday." | 4,0 s | Baja a bajo + tic |
| 25,5 – 30,0 | **"ANTES DE PAGAR, MANDALE EL LINK A VERA."** + `cybermobile.com.ar/vera · 7 días gratis` + logo | 4,5 s | Último tic y corte seco en 30,0 |

Cronometrado: ningún texto queda menos de 2,9 s; el chat, 4,0 s y 5,5 s; transiciones de 0,6 s. Si al animar algo no entra, se saca el sticker "SE REINICIA" antes que acelerar.

**Datos y transparencia:** tienda, dominio, precio y chat son **recreación** (rótulo fijo en pantalla durante los cuadros 2 y 3 del video). El dominio es inventado y obviamente falso; no aparece ninguna marca ni logo real. Sin datos personales. El dato es real: `observatorio/datos.json` (24/11): "Tienda online falsa" puesto 1 del ranking internacional (actividad 86, emergente) y en la lista de vigilancia de Argentina (puesto 12, actividad 64). El reloj que se reinicia es un patrón engañoso documentado en tiendas online (falsa urgencia).

## Música (nueva, no repite)
**UK garage / 2-step, 132 BPM, Fa# menor**, sintetizada con `musica.py` nuevo (sin derechos). El **tic del reloj es el hi-hat** (con swing) y el **rebobinado** del reloj es un efecto de cinta hacia atrás que cae en 1,0 s y en 6,0 s. Drop con bajo sub en el sello (compás 11, 18,2 s). Distinta de las anteriores: pop-electrónico 106 (14/11 y 16/11), techno 126 (17/11), thriller 90 (18/11). Registrar en `textos.json` al producir.

## Cierre / CTA
Sin "Comentá VERA" en el video (cierre por estilo + dato + acción concreta: "Antes de pagar, mandale el link a Vera"). En el texto: link en la bio (`/vera?o=bio`), la guía de tienda falsa, y en la historia el sticker con `/vera?o=historia`.

## Texto para Instagram
```
Ese reloj de "termina en 10 minutos" no está contando nada.

Recargás la página y vuelve a empezar. No es una oferta: es apuro armado para que pagues sin pensar.

Lo que vio Vera en esta tienda (recreación):
🚩 La página tiene 6 días de vida
🚩 Te da 10% extra si transferís a una cuenta personal
🚩 El reloj se reinicia

La tienda online falsa es la N.º 1 del ranking internacional del Observatorio de Fraude Digital en noviembre, y en Argentina ya está en vigilancia. El viernes es Black Friday.

Antes de pagar, entrá a la tienda escribiendo vos la dirección o mandale el link a Vera por WhatsApp: te responde en segundos con el semáforo. Probala 7 días gratis, link en la bio.

📌 Guardalo para el viernes y mandáselo a quien ya tiene el carrito lleno.

Las 8 señales de una tienda falsa, en nuestra guía: cybermobile.com.ar/guias/tienda-falsa-compras-online

#BlackFriday #TiendaFalsa #Estafas
```

## Versión TikTok
```
Ese reloj de "termina en 10 minutos" no cuenta nada: recargás y vuelve a empezar 🔁

Es una tienda falsa armada para el Black Friday. Antes de pagar, mandale el link a Vera por WhatsApp y te dice en segundos si es estafa.

Link en el perfil · 7 días gratis

#BlackFriday #estafas #comprasonline #argentina #tiendafalsa
```

## Historia de apoyo (jueves 26/11 a la noche o viernes 27/11 a la mañana)
1. Fondo negro, reloj gigante "09:59" con el círculo rojo. Texto: "Mañana te van a apurar con esto." Encuesta: **"¿Alguna vez recargaste la página para ver si el reloj era real?"** Sí / Nunca se me ocurrió.
2. Fondo rojo: "Si vuelve a 09:59, no es una oferta. Es una tienda falsa." + compartir el reel.
3. Crema: "¿Dudás de una tienda? Mandale el link a Vera antes de pagar." Sticker de link → `cybermobile.com.ar/vera?o=historia` ("Probar 7 días gratis").

## Por qué sumaría seguidores
Da un truco nuevo, útil y verificable en 5 segundos (recargar la página) justo el día en que todos compran: es el tipo de pieza que se manda al grupo ("che, mirá esto antes de comprar") y se guarda, y eso lleva el reel a no seguidores. El estilo estándar (tipografía gigante, color pleno, Vera en el celular) hace que se reconozca la cuenta, y el remate con el Observatorio muestra que detrás hay datos y una herramienta, no otra cuenta de alertas.

## Embudo y medición
- **Tramo:** alcance (principal) + venta suave (Vera como acción antes de pagar, en el texto y en la historia).
- **Se mide con:** envíos y guardados del reel, % de alcance a no seguidores y seguidores ganados por el reel (Instagram, a las 48 h); clics en `/vera?o=bio` y `/vera?o=historia` del 26 al 28/11 (Redis `cm:vera:clics:<fecha>`).

## Ideas descartadas (las 3 mejores)
- "Ese link no es de [tienda]": 3 dominios que copian a tiendas conocidas. Descartada: sin marca real en pantalla pierde fuerza, y con marca real es riesgoso.
- "La cuenta del 10% extra": por qué te premian si transferís (no se puede desconocer). Guardada como segunda pieza/carrusel para el sábado 28/11 (repurposing).
- "¿Tienda falsa o segura?" (juego de 2 tiendas, idea del agente SEO). Descartada como reel: el juego de "¿cuál es la falsa?" ya se usó el 17/10 y el 21/10; se aprovecha como CTA a la guía.
