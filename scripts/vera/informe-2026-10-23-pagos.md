# Vera: oferta de pago dentro de la ventana de 24 h (23/10/2026)

Mejora 1 del informe del 21/10, aprobada por Germán en el Centro de Mando. Flujo "CYBER MOBILE 2026_10 - V38" (`fFoGJZEQRy0g6Dt1`). Versión **V40** publicada el 23/10 (activa `dbae91c4`; la anterior era `51522a70`).

## El problema
El aviso del día 7 salía por el cron de las 20 h a todos, y Meta descarta sin error lo que se manda a quien no escribió en las últimas 24 h. Al día siguiente la persona quedaba cortada sin haber visto nunca el link de pago.

## Qué cambió
No se reescribieron los nodos grandes. Se sumaron 5 nodos chicos y se cambiaron 4 textos.

**Mensajes que entran** (antes de "Interpretar Estado Suscripcion"):
- **Leer Oferta Vista** (Redis get): lee `recordatorio_oferta:<número>`.
- **Guardar Ventana 24h** (Redis set): guarda `recordatorio_vent:<número>` con la hora. La clave vence sola a las 23 h.
- **Decidir Oferta** (Code, después de Interpretar): deja pasar el item igual y le suma `ofertaCierre` y `planesTexto`.
  - La oferta sale los días 5 y 6 de la prueba, y desde el día 8 si la persona todavía no vio los links.
  - El día 7 no, porque ese día sale el aviso de las 20 h.
  - Sale una sola vez por persona cada 30 días.
  - Nunca va a staff, ni en audios (ahí los links se borran), ni cuando la persona está pidiendo un plan o mandando un comprobante.

**Respuesta:**
- **HTTP WhatsApp Response**: agrega `ofertaCierre` al final del texto de Vera.
  - La tarjeta, el caso guardado y el patrón siguen usando la respuesta sola, así que la lista de planes no se mete en la tarjeta.
- **Marcar Oferta Vista** (Redis set, rama nueva desde "Preparar Caso"): guarda `recordatorio_oferta:<número>` por 30 días cuando la oferta salió. Si no salió, escribe una clave descartable (`cm:oferta_noop`).

**Avisos de las 20 h:**
- **Filtrar Ventana 24h** (Code, entre "Calcular Usuarios Dia 7 y 8" y "¿Es Dia 7?"):
  - El aviso del día 7 y el final salen solo a quien escribió hace menos de 23 h.
  - Solo se corta a quien ya vio los links (por el aviso del día 7 o por la oferta en una respuesta) y no escribió en las últimas 23 h.
  - A quien escribe todos los días se lo corta desde el día 10, si ya recibió el aviso del día 7.
  - A quien nunca vio el link no se lo corta: lo ve en su próxima respuesta.

**Textos con los 3 planes, su precio y su link:** "Enviar Recordatorio Suscripcion" (día 7), "Enviar Aviso Final" y "Aviso Servicio Bloqueado".
- Cada texto le pide a la persona que escriba **QUIERO SUSCRIBIRME**, **PACK PADRES** o **PACK FAMILIAR**. Esas palabras ya activan el pedido de comprobante del plan correcto, así que el pago se verifica igual que antes.

## Precios: por qué hoy siguen en $12.000 / $20.000 / $40.000
- Los links (`mpago.la/2JnQADw`, `2vDsX8i`, `2fMQazW`) son planes de suscripción de Mercado Pago con el monto fijo.
- Desde acá no hay salida a Mercado Pago: la red bloquea `mpago.la` y `api.mercadopago.com`.
- Hacerlo desde n8n obligaba a copiar el token de MP a otro flujo o a meter un nodo temporal en el flujo en vivo. No se forzó.
- Si Vera mostrara $10.000 y Mercado Pago cobrara $12.000, le estaríamos diciendo algo falso al cliente. Por eso los textos quedaron con los montos que cobra hoy cada link, y el cambio quedó listo para hacer en minutos.

### Pasos para Germán (Mercado Pago, unos 5 minutos)
1. Entrá a mercadopago.com.ar desde la computadora → **Tu negocio** → **Suscripciones** (o "Planes de suscripción").
2. Abrí el plan **Individual** (el del link `mpago.la/2JnQADw`) → **Editar** → monto mensual **$10.000** → Guardar.
3. Repetí con **Pack Padres** (`mpago.la/2vDsX8i`): **$17.000**.
4. Repetí con **Pack Familiar** (`mpago.la/2fMQazW`): **$33.000**.
5. Si Mercado Pago no deja editar el monto, creá 3 planes nuevos con esos montos y pasá los 3 links nuevos.
6. Avisá en el Centro de Mando. Hoy no hay nadie suscripto, así que no se afecta a ningún cliente.

### Qué hace el agente vera-n8n cuando Germán avise
Cambiar los montos (y los links, si son nuevos) en:
- n8n: "Decidir Oferta", "Filtrar Ventana 24h", "Crear Preferencia MP" y "Armar Pack" (constantes `PLANES`/`PACKS`).
- n8n: "Armar Regalo Mamá" (dice "$12.000 por mes").
- n8n: **`MP_MONTO` en "Config Secretos": de 12000 a 10000.** Es imprescindible: el control del comprobante rechaza pagos menores al 90 % de ese valor, así que con 12000 rechazaría un pago de $10.000.

## Otros lugares con los precios viejos (para actualizar el mismo día)
- Web: `index.html` (tarjetas de planes, líneas ~667–683) y `agente/index.html`:
  - datos estructurados `"price": "12000"`;
  - tarjetas de planes (líneas ~376–378);
  - precio destacado (~424);
  - link "Pack Padres (3) $20.000" (~429).
- Extensión: `extension/panel.html` (lista de planes) y `extension/TIENDA.md` ("desde $12.000").
- Redes: `scripts/redes/generar.mjs` (texto de planes, línea ~245) y `scripts/redes/plantilla.html` (líneas ~321–323).
- Documentos internos: `CLAUDE.md` (sección "Planes"), `scripts/OBJETIVO.md` y `scripts/campanas/2026-10-19-primeros-10.md`.
- Piezas ya publicadas (`redes/2026-10-15/`): quedan como están, son historia.

## Cómo se probó
- No se mandó ningún mensaje.
- El código de los 2 nodos nuevos se corrió fuera de n8n (con el código guardado en el borrador) junto con los nodos "Calcular" e "Interpretar" tal como están.
- **Datos reales del cron del 22/10:** de las 10 corridas simuladas (5 fechas, con y sin mensaje en las últimas 23 h), 3 dan distinto. Las 3 son el mismo caso: la única persona en prueba (empezó el 20/10).
  - Antes recibía el aviso del día 7 aunque no hubiera escrito, y Meta no se lo entregaba.
  - Ahora solo lo recibe si escribió en las últimas 23 h; si no, ve la oferta en su próxima respuesta.
  - Los cortados y el staff no cambian.
- **Mensajes reales de la semana:** solo hubo de staff y un primer mensaje. Ninguno cambia (ni la acción ni la oferta).
- **Recorridos simulados de 16 días:** escribe todos los días; solo el día 1; días 1, 5 y 9; días 1 y 7; vuelve el día 14; días 6, 7 y 8.
  - Nadie es cortado sin haber visto los links.
  - Ninguna oferta se repite.
  - El aviso del día 7 y el final solo salen dentro de la ventana.
  - El audio, el staff y la falta de lectura de Redis no muestran la oferta.

## Para verificar con el próximo mensaje real
- Que exista `recordatorio_vent:<número>` después de un mensaje (Executions → nodo "Guardar Ventana 24h").
- La primera persona que escriba en su día 5 o 6 tiene que recibir la respuesta normal más el bloque "———" con los 3 planes, una sola vez, y debe quedar `recordatorio_oferta:<número>`.
- En el cron de las 20 h, mirar la salida de "Filtrar Ventana 24h".
- La persona que empezó el 20/10 llega a su día 7 el 26/10.

## Cómo volver atrás
En n8n → flujo → historial de versiones, restaurar y publicar la versión `51522a70` (V39c). O con el conector: `restore_workflow_version` + `publish_workflow`. Las claves nuevas de Redis no molestan si se vuelve atrás.

`analizar_imagen` no se tocó: el arreglo de "500 mil" en `numDescargas` sigue pendiente.
