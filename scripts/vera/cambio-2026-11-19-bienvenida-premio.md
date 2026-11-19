# Cambio 19/11: bienvenida que pide el primer caso, toque antes de las 24 h y premio "2 estafas = 1 mes gratis"

Pedido de Germán (19/11). Flujo de Vera `fFoGJZEQRy0g6Dt1`. Motivo: la revisión de hoy (`informe-2026-11-19.md`) mostró que la gente nueva escribe "Hola", recibe la bienvenida y no vuelve.

## Versiones
- Para revertir: **V45b `714d25db-ffa6-40ef-bb82-41eef8491d60`** (`publish_workflow` con ese versionId).
- Publicada: **V46** (ver el final de este archivo).

## 1. Bienvenida corta (nodo `Armar Mensaje Bienvenida`)
- Sigue el video. El texto ahora es corto: prueba de 7 días desde el primer caso, pedido concreto y el premio en una línea:
  > Tenés *7 días de prueba gratis*, con acceso completo. Empiezan a contar recién cuando te ayude con tu primer caso.
  >
  > 👉 Mandame el último mensaje, link o número raro que te llegó y lo reviso ya. También sirve una captura o un audio.
  >
  > 🎁 Si te detecto 2 estafas, tu prueba pasa a ser de *1 mes gratis*.
- Si el video falla, va antes una línea de presentación (qué revisa Vera y el semáforo).
- `AI Agent` (solo el campo de texto, no el prompt de sistema): en el primer contacto ya no se le pide "el bloque completo de presentación" (por eso mandaba ~200 palabras, con un Instagram equivocado). Ahora, si es solo un saludo, responde una frase corta; si trae un caso, responde el caso.

## 2. Toque antes de que se cierre la ventana de 24 h (rama nueva)
- `Trigger Toque Ventana 24h` (cada hora, minuto 17) → `Listar Usuarios Toque` (`vera_u:*`) → `Listar Ventanas Toque` (`recordatorio_vent:*`) → `Elegir Toque` → `Marcar Toque Enviado` → `Enviar Toque`.
- A quién: primer contacto marcado (`vera_u.nv`, lo escribe `Armar Datos Usuario` en el primer mensaje), sin ningún caso (`pi`), sin estafas contadas, sin toque previo (`tq`), y entre 18 y 22 h desde su **último** mensaje (siempre dentro de las 24 h: gratis, sin plantilla). Nunca staff ni el número de Vera. Una sola vez: `tq` se marca antes de enviar.
- Texto:
  > Hola, soy Vera de nuevo 👋 ¿Te llegó algún mensaje, link o llamada rara estos días? Reenviámelo acá y en un minuto te digo si es estafa.
  >
  > Tus 7 días gratis arrancan recién con ese primer caso. Y si te detecto 2 estafas, tu prueba pasa a ser de *1 mes gratis* 🎁
- Solo alcanza a quien escriba por primera vez desde la publicación (las personas anteriores no tienen `nv`).

## 3. Premio "2 estafas = 1 mes gratis"
- `Preparar Caso` calcula el premio (antes de `HTTP WhatsApp Response`, así el aviso va en la misma respuesta). `Armar Datos Usuario` lo guarda en `vera_u:<número>`:
  - `e2`: huellas (hash, sin datos personales) de los casos 🔴 distintos. Huella = sha256 del adjunto (imagen, documento, audio) o, en texto, los links/dominios, mails y números normalizados (sin `https://`, `www.`, barra final); si no hay datos, el texto normalizado. El mismo link repetido no suma.
  - 🔴 = una línea de veredicto que **empieza** con 🔴. Un 🔴 nombrado dentro de una frase (por ejemplo, en una respuesta 🟡) no cuenta. 🟡 no cuenta.
  - Con la 2.ª: `pe` (fecha), `ghm: 'estafas'` y `gh` = acceso gratis hasta el inicio de la prueba + 29 días (30 días en total). Si ya tenía más tiempo (referidos), +30 sobre lo que tenía. Si su prueba es tan vieja que eso ya pasó, 30 días desde hoy. Suscriptor activo: `pePago` y el mail pide aplicarlo a mano en Mercado Pago.
  - Una sola vez por persona (`pe`). Nunca staff. Solo cuenta 🔴 desde la publicación.
- Aviso al pie de la respuesta (`HTTP WhatsApp Response`; en audios va como texto aparte):
  > ———
  > 🎁 *¡Ganaste 1 mes gratis!* Es la segunda estafa que te detecto, así que tu prueba ahora va hasta el *DD/MM/AAAA*. Seguí mandándome todo lo que te parezca raro.
- Mail de aviso a cybermobile.ai@gmail.com (`¿Ganó Premio Estafas?` → `Mail Premio Estafas`, con los últimos 4 dígitos). Hoy no sale (SMTP bloqueado desde el 09/11); el nodo sigue de largo si falla (`continueRegularOutput`).
- La IA conoce el premio y cuánto lleva (campo de texto de `AI Agent`), pero no lo anuncia: el aviso lo agrega el sistema.
- Con `gh` vigente ya funcionaba todo lo de V45: no hay oferta, aviso del día 7 ni corte.

## Cómo se probó
1. **Simulación local** de los nodos nuevos (`Preparar Caso` + `Armar Datos Usuario` y `Elegir Toque`) con 12 + 9 casos: primer "Hola", 1.ª roja, mismo caso repetido (otros espacios), mismo link con `https://` y barra, 🟡 que nombra 🔴 en una frase, 2.ª roja distinta (imagen), 3.ª roja después del premio, staff, referidos con fecha lejana (+30), suscriptor activo, audio, prueba vieja; toque: nuevo a 20 h (sí), con caso (no), con toque previo (no), staff (no), a 10 h (no), a 23 h (no), viejo sin `nv` (no), con roja (no), escribió de nuevo hace 19 h (sí).
2. **Casos reales** (los 9 mensajes de WhatsApp guardados en n8n desde el 05/11): ninguna respuesta tenía 🔴, así que la regla nueva de 🔴 y la vieja dan igual en los 9 (0 distintos) y ningún premio se habría dado. Dan distinto 2 de 9: los dos primeros mensajes de personas nuevas (07/11 y 16/11) habrían recibido la bienvenida corta y quedado marcadas para el toque. Las dos estaban dentro del rango del toque (18 a 22 h) antes de que se les cerrara la ventana. Los otros 7 (staff) no cambian.
3. **Ejecuciones manuales del borrador en n8n** con números de prueba inexistentes:
   - Primer "Hola": video + bienvenida nueva + una línea de la IA ("Hola, mandame lo que necesites que revise."); `vera_u` con `nv`.
   - Toque simulado (última vez hace 20 h): salió a ese número y a ninguno más (no salió al que ya tenía caso ni al de 10 h). Segunda corrida: 0 envíos (una sola vez).
   - 1.ª estafa 🔴 (falso familiar): `pi` y `e2` con 1 huella, sin premio.
   - 2.ª estafa 🔴 distinta (falso soporte de Mercado Pago): premio, aviso al pie de la misma respuesta ("…va hasta el *18/12/2026*"), `pe`/`gh` en Redis. El mail dio `Connection timeout` (SMTP) y el flujo terminó bien.
   - Mismo caso 🔴 repetido (otro número con esa huella ya cargada): no suma, sin premio.
   - "¿Hasta cuándo puedo usarte gratis?" después del premio: la IA contestó 18/12/2026.
   - Staff (número de prueba con un número del staff en el mensaje): reconocido como staff, nada guardado en `vera_u`.
   - Después se borraron todas las claves de prueba (casos, `vera_u`, ventanas, memoria del chat, candados, códigos de referido, contadores del día) y se archivó el flujo temporal "TEMP pruebas V46 (borrar)".

## Para verificar con el próximo mensaje real
- Persona nueva que dice "Hola": que reciba video + bienvenida corta + una sola línea de la IA, y que se cree `vera_u` con `nv`.
- Entre 18 y 22 h después, si no mandó nada: que `Trigger Toque Ventana 24h` le mande el toque una vez (`tq`) y que Meta lo acepte.
- Primera persona con 2 estafas 🔴 distintas: aviso en la misma respuesta, `gh` correcto y mail (no va a llegar hasta que se arregle el SMTP).

## Observaciones (no se tocaron)
- Las estafas contadas solo por texto (sin link, número ni captura) a veces salen sin semáforo: la IA contesta "es una estafa" sin 🔴. Esas no suman al premio (la regla pide 🔴).
- `Reportar al Observatorio` nunca reporta: lee `patronDetectado` del nodo Redis anterior (`Contar Patron Campana`), que no lo trae. El puente al Observatorio está apagado de hecho.
- El historial de ejecuciones sigue guardando las claves de `Config Secretos` en cada ítem (pendiente ya conocido).

## Publicación
- **V46 publicada el 19/11 ~15:56 UTC: `f8d1b488-3a55-48c2-a24c-e4a5bc82b6f3`.**
- Para revertir: `publish_workflow` con `714d25db-ffa6-40ef-bb82-41eef8491d60` (V45b). Las claves nuevas (`nv`, `tq`, `e2`, `pe`, `ghm`) no molestan a V45b.
