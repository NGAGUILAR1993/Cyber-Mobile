# V50 (25/11): Vera después de la prueba gratis

Pedido de Germán: cuando la prueba terminó, Vera respondía solo el texto fijo "tu período de prueba ya terminó". Ahora sigue sin analizar nada, pero contesta dudas sobre Vera y ofrece los planes con calidez.

- **Publicada:** V50, versionId `f4e68899-6860-4f10-9871-adf5c0afa202`.
- **Para revertir:** `publish_workflow` con `d3f768c1-2511-4999-aecc-843967baa20a` (V49).

## Qué cambió (4 nodos + 1 nuevo)
- `Interpretar Estado Suscripcion` define **prueba vencida** así: `cortado`, o `pendiente`/`prueba` con 7 días o más desde el primer caso (del día 8 en adelante), sin acceso gratis vigente (referidos o premio). Para esas personas:
  - una imagen va a la verificación del comprobante, como antes;
  - "quiero suscribirme", "sí" o un pack van al pedido de pago. Una pregunta como "¿cómo cancelo si me suscribo?" no cuenta como pedido;
  - "no" lleva a la despedida;
  - todo lo demás pasa por `ignorar`.
  - Si está en `pendiente_pago` con la prueba vencida y hace una pregunta o manda un caso, también va a `ignorar`. Con la prueba vigente se mantiene V49.
- **Nodo nuevo `Responder Post Prueba`** (entre `¿Ignorar Cortado?` y `Aviso Servicio Bloqueado`): una IA (Gemini) sin herramientas escribe el cuerpo de la respuesta.
  - Dice que la prueba terminó y contesta sobre Vera: qué revisa, cómo se usa, /agente, la extensión (cybermobile.com.ar/chrome), los planes, la cancelación desde MP → Suscripciones y el contacto.
  - Si la persona manda un caso, explica que el análisis viene con la suscripción y da solo consejos generales.
  - Un control descarta la respuesta si trae semáforo o veredicto ("parece estafa", "es seguro", riesgo), links que no sean nuestros o de Mercado Pago, o números largos. En ese caso, o si Gemini falla, sale un texto fijo con el mismo contenido.
  - Siempre suma, por código, los planes con precio y link (de `Decidir Oferta`), cómo activarlo y info@cybermobile.com.ar.
- `Aviso Servicio Bloqueado` envía `textoPostPrueba`, con el texto viejo de respaldo.
- `Pedir Reintento Comprobante`: si la imagen no se puede leer y la persona tiene la prueba vencida, explica las dos posibilidades (si es el comprobante, que lo mande completo; si es un caso, que el análisis viene con la suscripción). Además, la expresión quedó en una sola línea: las líneas de corte crudas fallaban apenas se le agregaba `.first()`.
- `Nota Prueba vencida` actualizada.

## Cómo se probó
- **Simulación local** de `Interpretar` V49 contra V50 con 199 combinaciones de estado y mensaje:
  - 34 dan distinto, todas personas con la prueba vencida o `pendiente_pago` vencido;
  - el staff, la prueba vigente, `pendiente_pago` vigente o sin casos, el acceso gratis por premio o referidos, los activos y los nuevos dan igual.
- **Ejecuciones reales que quedan en n8n** (las 9 desde el 12/11): ninguna cambia (6 son del staff, 1 es una persona nueva y 2 son `pendiente_pago` sin casos).
- **Población actual:** solo 2 personas tienen casos y figuran `cortado`. Son los "2 casos" de Germán y las únicas que hoy reciben la respuesta nueva. Sus ejecuciones viejas ya no están en el historial de n8n (se borran solas).
- **15 ejecuciones manuales del borrador** con números inexistentes (54900000009xx): qué hace Vera, cómo cancelo, link sospechoso, audio, captura, comprobante con `pendiente_pago` vencido y con `pendiente_pago` vigente, quiero suscribirme, pregunta de `pendiente_pago` vencido, prueba vigente y premio vigente. Todo bien. El staff se probó solo en simulación, para no escribirle a un número real.
- Las claves de prueba se borraron (se verificó con un listado vacío) y el flujo temporal se archivó.

## Para verificar con el próximo mensaje real
- La primera persona `cortado` que escriba: ver en la ejecución que `Responder Post Prueba` salga con `fuentePostPrueba: ia` y sin veredicto.
- Pendiente: en el cron de las 20 h, `Chequear Estado Suscripcion Dia8` está desconectado. Quien no responde el aviso del día 7 queda en `pendiente` o `prueba`. V50 igual los trata como vencidos desde el día 8.
- Pendiente: `Pedir Reintento Comprobante` sigue mostrando $12.000 como monto y cybermobile.ai@gmail.com (no se tocó).
