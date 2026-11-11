# Cambio 11/11: prueba desde el primer caso, referidos y promo de noviembre

Pedido de Germán (11/11). Flujo de Vera `fFoGJZEQRy0g6Dt1`.

## Versiones
- Anterior a todo esto (para revertir): **53cea654** (V44).
- V45a, publicada 11/11 17:3x UTC: **9c8c6e8e** (solo el disparador del envío por lote).
- V45b, publicada 11/11 19:10 UTC: **714d25db** (regla de prueba, referidos, promo automática y arreglo de `Chequear Estado Suscripcion`).

## 1. La prueba de 7 días empieza con el primer caso analizado
- Nuevo dato por persona en Redis: `vera_u:<número 549…>` (JSON). `pi` = fecha del primer caso real.
- "Caso real": adjunto (imagen, documento, video), link, mail, número de 8+ dígitos (teléfono, CBU), alias, @usuario, o una respuesta de Vera con semáforo (en audios, solo el semáforo). Un "hola" o una pregunta general no cuenta.
- `Interpretar Estado Suscripcion`: los días salen de `pi`. Sin `pi`, el contexto le dice a Vera que la prueba todavía no empezó. Quien figuraba `pendiente` o `cortado` sin ningún caso vuelve a `prueba` (y se guarda así) y arranca con su próximo caso. Si estaba `pendiente` y responde "sí", igual puede pagar.
- `Decidir Oferta`: oferta de los días 5, 6 y 8+ y el recordatorio 📌 cuentan desde `pi`. El 📌 sale una vez, el día 1 o 2 de la prueba.
- `Calcular Usuarios Dia 7 y 8` (avisos de las 20 h): lee `vera_u:*` (nodo nuevo `Listar Usuarios Vera`). Sin `pi` no hay aviso del día 7, ni corte, ni aviso final. Con acceso gratis vigente, tampoco.
- Bienvenida: "Tenés 7 días de prueba gratis… Empiezan a contar recién cuando te ayude con tu primer caso."
- Migración (una vez): 6 personas no staff con casos en Redis (60 días). 2 tenían un caso real y quedaron con `pi` (09/28 y 10/06, las dos ya cortadas). Las otras 4 no tuvieron ningún caso real: arrancan con el próximo. Con la regla vieja, 4 de 6 tenían otra fecha de inicio.

## 2. Referidos (hasta el 30/11)
- Link personal: `https://wa.me/5491170598505?text=Hola Vera 👋 Me pasaron tu contacto. Código VRxxxxx`. El código es fijo por número y se guarda en `ref_cod:<código>` → número.
- Cuando una persona nueva (sin estado ni casos ni datos previos) escribe por primera vez con un código, rama nueva desde `Armar Datos Usuario`: lee código, datos, estado y ventana de quien compartió → `Armar Premio Referido`.
  - No paga: +90 días de acceso gratis (`gh`), contando desde el fin de su prueba o de un regalo anterior.
  - Paga (`activo`): queda anotado (`rpago`) y sale un mail a cybermobile.ai@gmail.com para aplicarlo en Mercado Pago.
  - Una sola vez por amigo (`ramigos`), nunca a sí mismo.
  - Aviso: si quien compartió escribió en las últimas 23 h, le llega ya; si no, Vera se lo dice en su próximo mensaje (`rav`).
- El amigo recibe la bienvenida normal.

## 3. Promo de noviembre
- Automática: la primera vez que una persona no staff escribe entre el 11/11 y el 30/11 (desde su segundo mensaje), después de la respuesta de Vera sale el texto aprobado con su link, como mensaje aparte (`Enviar Texto Extra`). Una vez por persona (`pn`).
- Envío puntual: flujo "Promo noviembre - envío" (`YhOwfmUDmLAPrdEO`), disparador manual. Manda a través del flujo de Vera (disparador `Disparador Promo Lote`, sin claves propias), marca `pn` solo si Meta aceptó y manda mail con el resultado (últimos 4 dígitos). Queda en `MODO = 'prueba'` (solo Germán); para los 8 usuarios, cambiar a `'todos'` en el nodo `Destinatarios`.

## Bug previo corregido
- `Chequear Estado Suscripcion` leía `suscripcion:` (clave vacía) porque tomaba el número de un nodo Redis anterior. Todos los no staff figuraban siempre en `prueba`: nadie quedaba cortado, el comprobante de pago no se verificaba y la bienvenida de la IA nunca se activaba. Ahora lee el número de `Prepare Payload`.

## Cómo se probó
- Simulación local de los nodos nuevos con 13 casos (nuevo, link, día 2, día 5, sin casos reales, cortado con y sin casos, pendiente que dice sí, referido, regalo vigente, staff, audio, imagen) y de los avisos de las 20 h (regla vieja: 5 avisos; nueva: 2, los que tienen caso real).
- En n8n, ejecuciones manuales del borrador con números de prueba inexistentes: primer mensaje (bienvenida nueva, sin promo), link (arranca la prueba y sale la promo con link propio), amigo nuevo con el código (+90 días al que compartió, aviso inmediato porque estaba en ventana) y pregunta "hasta cuándo" (Vera responde la fecha del regalo). Las claves de prueba se borraron después.
- Camino normal de entrada con un mensaje de prueba marcado como duplicado: sigue igual.
- Envío puntual: prueba a Germán aceptada por Meta (estado PENDING), probablemente fuera de su ventana de 24 h.

## Efecto del arreglo de `Chequear Estado Suscripcion`
- 2 personas que figuran `cortado` y tuvieron casos reales (terminan en 0266 y 6897) ahora reciben el aviso de servicio bloqueado si escriben; antes Vera les seguía respondiendo por el error. Las dos están en la lista del envío del 12/11: el texto de la promo les dice que sus 7 días arrancan con el próximo caso, y no es así para ellas. Decisión de Germán: o se les da una prueba nueva (borrar `pi` en su `vera_u`) o se las saca del envío.
- 1 persona `cortado` sin casos reales (8383) vuelve a `prueba` en su próximo mensaje.

## Pendiente / a verificar
- SMTP: desde al menos el 09/11 los mails del flujo dan "Connection timeout" (también el resumen de la alerta del lunes). El mail de la promo y el de referidos quedan configurados, pero no van a llegar hasta que se arregle el SMTP.
- `Chequear Bloqueado` tiene el mismo error que tenía `Chequear Estado` (lee `bloqueado:` vacío). No se tocó.
- Meta acepta y puede no entregar fuera de las 24 h; el estado de entrega no llega a n8n.
