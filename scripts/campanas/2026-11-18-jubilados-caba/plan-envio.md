# Plan de envío (se activa recién con la aprobación de Germán)

## Cronograma
- Lotes de ~20 mails por día, individuales, lunes a viernes, 10:00 a 12:00 AR, desde info@ por Zoho (`ZohoMail_sendEmail`, cuenta `7816472000000008002`).
- Orden por comuna (1 a 15), así cada lote queda parejo y se puede medir por zona. Primer envío: el día hábil siguiente a la aprobación.
- Recordatorio único a los 7 días corridos, solo a quienes no respondieron ni pidieron BAJA ni rebotaron.
- Contactos sin mail (llamada o WhatsApp institucional): ir marcados en `lista.csv`; los hace Germán o quien él indique con el guion de `textos.md`, máx. 10 por día.
- Las comunas y la Dirección General de Personas Mayores (personasmayores@buenosaires.gob.ar) van en el último lote, con el mismo mail inicial adaptado ("para difundir entre los centros de su zona").

## Qué se mide
- Respuestas (% de enviados), charlas pedidas y charlas realizadas.
- Pruebas de Vera con origen `charla` (clics en `/vera?o=charla`, Redis `cm:vera:clics:<fecha>`, y personas nuevas que escriben a Vera).
- Rebotes y bajas (para limpiar la lista).
- Corte de revisión: a las 48 h de cada lote y a los 7 días.

## Registro (`seguimiento.csv`)
Una fila por centro. Al enviar: id, nombre, comuna, canal (mail/llamada/whatsapp), fecha_envio, lote, estado=enviado. Cuando hay novedad: estado (enviado, recordatorio, respondió, charla agendada, charla hecha, baja, rebote, sin respuesta), fechas y notas. Revisar info@ a diario por respuestas y rebotes.

## Qué se necesita de Germán
1. Aprobar `lista.csv` y `textos.md` (y el folleto).
2. Decidir si el folleto va adjunto en PDF o solo el link.
3. Definir quién da las charlas y en qué días/horarios hay disponibilidad (para responder con fechas reales).
4. Si hace las llamadas: confirmar el guion y el cupo diario.

## Cobertura de la lista (honesta)
La lista pública verificable es corta: los centros de jubilados privados casi no publican mail. Hay mail institucional verificado para 5 comunas (1, 2, 3, 10, 14) y la Dirección General de Personas Mayores; el resto de las comunas y los Centros de Día (GCBA) se alcanzan por el 147 / WhatsApp 11-5050-0147 o a través de la Dirección General. Para llegar a los centros de jubilados de cada comuna lo más efectivo es pedirle a la Dirección General de Personas Mayores y a cada Comuna que difundan la charla. Seguir ampliando con nuevos centros (registro oficial: mapa epok.buenosaires.gob.ar "centros de jubilados") es trabajo de una segunda ronda.
