# Cambio 19/11: semáforo siempre y puente al Observatorio (V47)

Pedido de Germán (19/11). Flujo de Vera `fFoGJZEQRy0g6Dt1` y flujo del Observatorio `Gx0TbShbtwlKauw1`.

## Versiones
- Para revertir Vera: **f8d1b488** (V46).
- Para revertir el Observatorio: **ce505bf6**.
- Publicadas: ver "Resultado" al final.

## 1. Semáforo siempre (nodo `AI Agent`, campo de texto)
- Se sumó una línea fija `SEMAFORO_OBLIGATORIO` al bloque `<contexto_interno>`: cuando Vera evalúa un caso concreto (aunque sea un relato de texto sin link, número ni captura, o contado en una nota de voz), una línea tiene que **empezar** con 🔴 (estafa), 🟡 (dudoso) o 🟢 (sin señales). Si el reporte de una herramienta ya trae semáforo, ese manda.
- No llevan semáforo: saludos, gracias, preguntas sobre qué hace Vera, la suscripción, el pago o el premio, consejos de configuración ni pedidos de un dato.
- El system prompt no se tocó. La regla del premio "2 estafas = 1 mes gratis" (`Preparar Caso`) sigue igual: cuenta solo 🔴 al comienzo de línea y casos distintos.

## 2. Puente al Observatorio
- **Bug en Vera:** `Reportar al Observatorio` leía `$json`, que es la salida de `Contar Patron Campana` (un INCR de Redis): el patrón nunca llegaba y no se reportaba nada. Ahora lee `Preparar Caso`.
- **Bug en el Observatorio:** en `Parsear y Acumular`, el bloque que suma los reportes del agente usaba variables del bucle de noticias (`o`, `src`) que ahí no existen; el primer reporte tiraba error y cortaba todos. Se corrigió en el mismo bloque (fecha del evento = fecha del reporte, anillo 1). Además ya no pisa el `riesgo` de la modalidad con el color de un caso (el riesgo lo fija `gravedad.json`).
- **Qué se reporta:** solo `{id, modalidad, riesgo, origen: "agente", fecha (día)}`. Sin número, sin link, sin texto del usuario, sin canal (para no pisar el canal que el Observatorio saca de las noticias).
- **Cuándo:** respuesta con una línea que empieza con 🔴 (riesgo alto) o 🟡 (medio; como estaba pensado originalmente). 🟡 SIN VERIFICAR no cuenta. Nunca staff.
- **Modalidad:** se lee de la respuesta de Vera (sin links) y se lleva a una modalidad canónica del Observatorio (secuestro_whatsapp, suplantacion_contacto, phishing_mercadopago, phishing_banco, suplantacion_banco, alquiler_inexistente, romance_scam, etc.). Si no hay una modalidad clara, no se reporta (no se inventa).
- **Sin duplicados:** el `id` es una huella (hash) de la persona + el caso. El mismo caso repetido da el mismo id: `Fusionar Reportes` y el Observatorio lo cuentan una vez.
- **Modalidad (detalle):** primero se busca en la respuesta de Vera; si no la nombra, en el mensaje de la persona (solo para elegir la modalidad, no se guarda); por último, el patrón que ya calculaba `Preparar Caso`.

## Cómo se probó
- Ejecuciones manuales del borrador con 3 números de prueba inexistentes (mensajes de WhatsApp aceptados por Meta como PENDING; no existen):
  - Saludo "Hola" (primer contacto): una frase corta, **sin semáforo**, sin reporte.
  - Relato de texto de falso familiar: **🔴 \*Es una estafa.\*** al comienzo; el premio la contó (1 de 2). Reporte `suplantacion_contacto` (alto).
  - Relato dudoso (llamada "del banco" sin datos entregados): **🟡 \*Es dudoso.\***; reporte `suplantacion_banco` (medio).
  - Relato sin estafa (plomero conocido, con factura): **🟢**, sin reporte.
  - Pregunta "¿qué podés revisar?": sin semáforo, sin reporte.
  - Link de phishing real de una lista pública (imita a Spotify): 🔴 de la herramienta; reporte `phishing_streaming` (alto).
  - Mismo link otra vez: mismo id, la lista del Observatorio quedó con 1 reporte de ese caso (no 2) y el premio no lo contó dos veces.
- Los 2 primeros intentos de clasificar dieron la modalidad mal o vacía (falso familiar sin reporte; llamada del banco como "soporte técnico"). Se ajustaron las reglas y se volvió a probar: quedaron bien.
- Simulación local del lector del Observatorio con dos reportes iguales: antes, error "o is not defined" y 0 reportes; ahora 1 reporte (el duplicado se descarta).
- Muestra de 6 respuestas reales recientes (11/10 al 17/11; capturas, mail, teléfono, saludo): todas las que evaluaban ya traían el semáforo de la herramienta al comienzo de una línea, así que la regla nueva no les cambia nada (0 de 6 distintas). Con el puente nuevo, 1 de esas 6 daría reporte (perfil falso 🟡, `romance_scam`) si no viniera de un número del equipo (el staff no reporta); las otras 5 no (🟢 o sin modalidad clara). Casi todas las ejecuciones reales recientes son pruebas del equipo. No se reenviaron mensajes reales a Vera para no reprocesar datos de personas.
- Diferencia contra V46: solo cambian `AI Agent` (campo de texto) y `Reportar al Observatorio`; conexiones y los otros 212 nodos, iguales.
- Limpieza: flujo temporal (archivado) que borró las claves de Redis de los números de prueba, sus códigos de referido, los contadores `patron:*` del 19/11 (hoy no hubo mensajes reales; los había sumado sólo las pruebas, también las de V46) y la lista `observatorio:reportes` (sólo tenía reportes de prueba).

## Para verificar con el próximo mensaje real
- Que un relato de texto con estafa salga con 🔴 al comienzo y que `vera_u` sume la huella (`e2`).
- Que `Reportar al Observatorio` deje un reporte en `observatorio:reportes` y que la corrida siguiente del Observatorio (10:00 o 20:00) lo cuente (`_stats.agente` = 1, sin `agenteError`).
- Observado, sin tocar: en dos respuestas de prueba Vera usó género ("estar atenta", "Estás tranquila"), contra la regla del prompt. Viene de antes.

## Resultado
- Vera publicada: **26fb9028** (V47). Para revertir: `publish_workflow` con **f8d1b488** (V46).
- Observatorio publicado: **7a87fdfa**. Para revertir: **ce505bf6**.
