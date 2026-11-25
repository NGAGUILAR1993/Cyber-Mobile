# Propuesta 25/11 · "Vera en todos tus dispositivos"

**Estado:** PROPUESTA para aprobar (regla 12). Solo la preview. No se anima, no se renderiza video y no se publica nada sin el OK de Germán.
**Preview:** `scripts/redes/propuestas/2026-11-25-dispositivos/preview.jpg` (2880x2560: 3 pares situación → zoom a la pantalla, el cierre y la ficha). Fuente: `p.html` + `shot.mjs`. Pantallas: `capturas.mjs` → `pantallas/`.

## Concepto
La misma familia, tres estafas distintas, tres pantallas distintas. Cada escena empieza con la persona en su situación y la cámara entra lento hasta la pantalla, donde se lee la consulta y la respuesta de Vera. Cierre: con una suscripción, Vera está en el celu, en la web y en el navegador.

**Por qué es distinta:** ninguna pieza de los últimos 45 días mostró los tres canales juntos ni la extensión trabajando con un archivo. Es la primera que vende la suscripción por lo que da (cobertura en todos los dispositivos) y no por una sola estafa. Los personajes son los del reel del 13/11 ("vacaciones"), así quien los vio los reconoce.

## Gancho (primer segundo)
"EN TU CELU." + "Le llegó un cupón de $150.000 para gastar hoy. ¿Es real?" · `hookscore.py`: **54,7 (OK)**. Sin "¿Es real?" daba 49,8 (flojo): por eso va con la pregunta.

## Guion segundo a segundo (30 s, regla 1)
| Tiempo | Imagen | Texto a leer (en pantalla) | Sonido |
|---|---|---|---|
| 0,0 – 2,5 | **Situación 1.** La señora sola en su sofá con el celu, cara de duda. Leve push-in. | "EN TU CELU." (Anton, bloque amarillo) + "Le llegó un cupón de $150.000 para gastar hoy. ¿Es real?" (2,5 s) | Entra el pad + kick suave |
| 2,5 – 3,2 | **Zoom lento** a la pantalla del celular (0,7 s, ease-in-out) | — | Whoosh grave |
| 3,2 – 8,0 | **Pantalla 1.** Mano real con el celular: WhatsApp, contacto "Vera AI Antiestafas", en línea. Mensaje reenviado con `temu-ofertas-ar.shop` + "¿Esto es verdad?". Respuesta 🔴 RIESGO ALTO con 3 señales. El chat completo está a la vista desde el inicio; las marcas de Vera (círculo rojo al dominio, resaltador amarillo en cada señal) entran sobre el compás. Arriba: "¿UN CUPÓN DE TEMU? SE LO MANDÓ A VERA." | Chat 4,8 s | Golpe por cada marca |
| 8,0 – 8,6 | Transición: barrido turquesa (0,6 s) | — | — |
| 8,6 – 11,1 | **Situación 2.** El señor en su comercio, detrás del mostrador, frente a la compu. | "EN LA WEB." (bloque turquesa) + "Un cliente 'le pagó de más' y le pide que devuelva la diferencia." (2,5 s) | Baja el bajo |
| 11,1 – 11,8 | **Zoom lento** al monitor (0,7 s) | — | Whoosh |
| 11,8 – 16,6 | **Pantalla 2.** Monitor con la web real `/agente`: veredicto 93, RIESGO ALTO, "Estafa: comprobante falso y pedido de devolución", qué encontró y qué hacer. Arriba: "¿DEVOLVER $48.000 A OTRO CBU?" | 4,8 s | Resaltador en el compás |
| 16,6 – 17,2 | Transición: barrido verde (0,6 s) | — | — |
| 17,2 – 19,7 | **Situación 3.** La hija sola en su pieza, estudiando con la notebook. | "EN TU COMPU." (bloque verde) + "Bajó los 'apuntes del final' de un link que pasaron en el grupo." (2,5 s) | — |
| 19,7 – 20,4 | **Zoom lento** a la notebook (0,7 s) | — | Whoosh |
| 20,4 – 25,2 | **Pantalla 3.** Chrome con `drive-apuntes-compartidos.site`, la descarga `apuntes_final.zip` abajo, la extensión Vera fijada (ícono con aro turquesa) y su panel real abierto: 🔴 "No lo abras: el .zip trae un programa espía". Sticker rojo ".PDF.EXE ESCONDIDO". Arriba: "CLIC EN VERA, ANTES DE ABRIRLO." | 4,8 s | Golpe en el sticker |
| 25,2 – 25,8 | Transición a negro (0,6 s) | — | Drop |
| 25,8 – 30,0 | **Cierre.** Negro. "CELU · WEB · NAVEGADOR" en amarillo, turquesa y verde (cada palabra entra sobre un golpe). "UNA SUSCRIPCIÓN. VERA EN TODAS." Caja crema: "PROBALA 7 DÍAS GRATIS · cybermobile.com.ar/vera". Semáforo. | 4,2 s | Final y corte seco en 30,0 |

Cronometrado: cada placa ≥ 2,5 s, cada pantalla 4,8 s (≥ 4), transiciones y zooms de 0,6–0,7 s. Si al animar algo no entra, se saca el sticker ".PDF.EXE" o las marcas animadas: no se acelera.

**Versión de 7 días gratis en el cierre:** la prueba es por WhatsApp (`/vera?o=ig` en el texto). La frase del dueño va en el texto de IG completa.

## Qué es real y qué es recreación (rótulos en pantalla)
- **Personajes:** la familia creada con IA del reel del 13/11 (`redes/2026-11-13/vacaciones-vera/familia/`). No se presentan como personas reales.
- **Pantallas:** la UI es la real. Web `/agente` y extensión 1.4 capturadas con Playwright desde el código del repo (`capturas.mjs`); WhatsApp con el contacto "Vera AI Antiestafas" y su foto, como en los reels anteriores. **Las consultas y respuestas son de ejemplo:** rótulos fijos "RECREACIÓN · LINK Y CHAT DE EJEMPLO", "WEB REAL DE VERA · CONSULTA DE EJEMPLO", "EXTENSIÓN REAL DE VERA · CONSULTA DE EJEMPLO".
- **Dominios:** `temu-ofertas-ar.shop` y `drive-apuntes-compartidos.site`, inventados y obviamente falsos. Sin logo de Temu ni de Google Drive en ninguna imagen. CBU tapado (`0110 •••• ••4471`).
- No se dice que el caso coincide con una modalidad del Observatorio (el "comprobante falso" no figura en el ranking; se sacó ese renglón de la respuesta de ejemplo).

## FALTA para producir (bloqueo)
Las **3 fotos nuevas de situación** (señor en su comercio con la compu, señora sola en el sofá, hija sola en su pieza con la notebook) con los mismos personajes. En la preview van las fotos del 13/11 recortadas, rotuladas "FOTO DE REFERENCIA", para mostrar el encuadre; por eso todavía se ve a la familia junta en el living.
Intenté generarlas hoy y no se pudo: **Higgsfield tiene 0,3 créditos** (cada imagen con referencia cuesta 0,75–2 y el modelo barato pide plan pago) y **Canva devolvió "quota exceeded"** (llegó a generar solo una prueba del comercio, en baja). Para seguir hace falta una de dos: cargar créditos en Higgsfield (~6 créditos alcanzan para las 3 escenas en 2K con referencia) o que el dueño apruebe el gasto. Con eso: se generan las 3 escenas con `e1.jpg`/`e3.jpg` como referencia de personaje, se le muestran como imagen fija y recién después se anima.

## Música (nueva, no repite)
**Lo-fi house, 118 BPM, Re mayor**, pad cálido de piano eléctrico, kick suave y hats con swing, sintetizada con un `musica.py` nuevo. Cada escena sube un poco el filtro (celu → web → navegador) y el drop cae en el cierre (25,8 s). Distinta de pop-electrónico 106 (14 y 16/11), techno 126 (17/11), thriller 90 (18/11) y UK garage 132 (propuesta Black Friday).

## Texto para Instagram
```
En tu celu, en la web o con la extensión fijada en tu navegador.

Tres estafas, tres pantallas distintas:
📱 Un "cupón de $150.000 para gastar hoy" de una tienda que imita a Temu.
💻 Un cliente que "te pagó de más" y te pide que le devuelvas la diferencia a otra cuenta.
🧑‍💻 Unos "apuntes del final" en .zip que traen un programa escondido.

Con tu suscripción, Vera, tu asistente antiestafas, te acompaña en todos los dispositivos de tu día a día, disponible siempre para sacarte dudas y evitar estafas. Le mandás el link, el CBU o el archivo y te responde con el semáforo y qué hacer.

Probala 7 días gratis: link en la bio o cybermobile.com.ar/vera

📌 Guardalo y mandáselo a quien atiende un comercio, a tu vieja y a quien está rindiendo finales.

(Personas creadas con IA. Consultas de ejemplo en la herramienta real.)

#Estafas #Ciberseguridad #VeraAntiestafas
```

## Versión TikTok
- Mismo video de 30 s. Texto en pantalla igual; en el cierre cambia la caja: "LINK EN EL PERFIL · 7 DÍAS GRATIS".
- Descripción: `Celu, web o navegador: 3 estafas, 3 pantallas, una sola Vera. ¿Cuál te llegó a vos? Link en el perfil · 7 días gratis #estafas #argentina #ciberseguridad #fyp`
- Portada: cuadro 1 ("EN TU CELU." con la señora).

## Canal de WhatsApp
```
📱💻🧑‍💻 *Vera en todos tus dispositivos*
En tu celu, en la web o con la extensión de Chrome. Mandale el link, el CBU o el archivo antes de tocar nada y te responde con el semáforo.
Probala 7 días gratis: https://www.cybermobile.com.ar/vera?o=canal
```

## Por qué suma seguidores
Cada escena es un caso distinto que alguien conoce (la madre con el celu, el comerciante, la estudiante): se comparte a tres públicos a la vez y muestra la herramienta real en tres pantallas, algo que ninguna cuenta de alertas puede mostrar porque no tiene herramienta.

## Embudo y medición
**Venta** (es la pieza de la semana que pide la suscripción de forma explícita; refuerza **confianza** al mostrar la UI real). Se mide con clics en `/vera?o=bio` y `/vera?o=ig` en las 72 h siguientes, guardados y compartidos del reel, y descargas de la extensión (`/chrome`).

## 3 ideas descartadas
1. Pantalla partida en tres con la misma estafa a la vez en celu, web y extensión: más técnico, menos humano; el dueño pidió situaciones.
2. "Un día con Vera" de 8 a 22 h con un reloj: lindo, pero no entra legible en 30 s con tres pantallas.
3. Que la hija le instale la extensión al padre: suma una escena sin consulta y repite el vínculo familiar del 13/11.
