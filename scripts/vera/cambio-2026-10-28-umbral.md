# Cambio 28/10: riesgo de links según cuántos motores los marcan (V42)

Pedido de Germán (28/10). Flujo "CYBER MOBILE 2026_10 - V38" (`fFoGJZEQRy0g6Dt1`).

- **Versión nueva (publicada):** `d2034f93-31d9-4347-80ef-04eb853e46fe`, "V42: links por cantidad de motores".
- **Versión anterior (para volver atrás):** `9262c564-327e-49f1-8a16-76e36354cb06` (V41). Para revertir: `publish_workflow` con ese `versionId`.

## Qué motivó el cambio
Un mail oficial de argentina.gob.ar con un botón que pasa por el rastreo de emBlue (nts.embluemail.com). 1 de 93 motores lo marcó y Vera contestó "LINK PELIGROSO, Riesgo ALTO": antes, con **un solo** motor ya alcanzaba para dar riesgo alto.

## Qué cambió
Solo cambió el nodo **`verificar_url_virustotal`** (el código de la herramienta). No se tocó el prompt del AI Agent ni otros nodos.

1. **Nivel según la cantidad de motores que lo marcan como malicioso o phishing** (`last_analysis_stats.malicious`):

   | Motores | Nivel |
   |---|---|
   | 0 | 🟢 Riesgo BAJO |
   | 1 a 4 | 🟡 "LINK CON ALERTAS, Riesgo MEDIO" |
   | 5 o más | 🔴 "LINK PELIGROSO, Riesgo ALTO" (igual que antes) |

2. **Cómo se dice el hecho en el nivel MEDIO.** Cuando lo marcan entre 1 y 4 motores, el reporte suma esta línea: "Cómo leerlo: 1 de 93 sistemas de seguridad lo marcó como phishing (o peligroso, según la etiqueta del motor); los otros 92, no. Es una minoría: puede ser una falsa alarma o un aviso temprano…". El "Qué hacer" pasa a "no cargues claves ni datos desde este link; si dice venir de un organismo o una empresa, entrá escribiendo vos la dirección oficial". El "no lo abras" queda solo para 5 o más motores.

3. **Motores que lo marcan como "sospechoso".** Solos suben como máximo a 🟡 Riesgo MEDIO y nunca a ALTO. Antes, "sospechoso" más un indicio débil (por ejemplo, dominio nuevo) daba ALTO. No se suman a los maliciosos para llegar a 5.

4. **Señales que no salen de los motores, sin cambios.** Siguen funcionando las denuncias públicas y la antigüedad del dominio:
   - Dominio de menos de 30 días con 2 o más denuncias: sigue en ALTO aunque ningún motor lo marque.
   - La rama "sin informe" con denuncias sigue igual.
   - Sí cambió la etiqueta del amarillo por señales de contexto: ahora dice "SOSPECHOSO, Riesgo MEDIO".

5. **Destino de los links de rastreo (agregado).** Si el link es de un servicio de envío de mails o de una redirección conocida, el reporte dice a qué página termina llevando, siempre que el destino venga escrito dentro del link: en un parámetro, codificado con %xx, en base64 o entre `___`.
   - Servicios reconocidos: emBlue, Mailchimp, SendGrid, Mandrill, Mailjet, Constant Contact, Brevo, MailerLite, Amazon SES, Doppler, HubSpot, Outlook SafeLinks y l.facebook/l.instagram. Las redirecciones genéricas con `?q=`/`?url=` también se leen.
   - **El link no se abre:** solo se lee el texto. A la dirección final se le sacan los parámetros `utm_*`.
   - Se aclara "Ese destino no lo analicé por separado".
   - Si es un servicio conocido pero el destino no viene escrito, se avisa que lo analizado es el link de rastreo y no la página final.

La tarjeta de la red ("Armar Tarjeta Red") solo sale con 🔴, así que los casos de 1 a 4 motores ya no generan tarjeta.

## Cómo se probó (antes de publicar)
Se corrió el código viejo y el nuevo en Node, con las respuestas de VirusTotal, RDAP y Tavily simuladas:

| Caso | Antes | Ahora |
|---|---|---|
| 0 motores | 🟢 BAJO | 🟢 BAJO |
| 1 motor | 🔴 ALTO | 🟡 MEDIO |
| 3 motores | 🔴 ALTO | 🟡 MEDIO |
| 5 motores | 🔴 ALTO | 🔴 ALTO |
| 12 motores | 🔴 ALTO | 🔴 ALTO |
| 0 maliciosos y 2 sospechosos | 🟡 SOSPECHOSO | 🟡 SOSPECHOSO, Riesgo MEDIO |
| 1 sospechoso y dominio nuevo | 🔴 ALTO | 🟡 MEDIO (regla nueva) |
| 2 motores, dominio nuevo y 2 denuncias | 🔴 ALTO | 🔴 ALTO |
| Sin informe (límite de consultas) | 🟡 SIN VERIFICAR | 🟡 SIN VERIFICAR |

**Caso real** (link de la ejecución 11507 del 28/10, el que motivó el pedido), con 1 de 93:
- Antes: 🔴 ALTO.
- Ahora: 🟡 MEDIO, "1 de 93 sistemas de seguridad lo marcó como peligroso; los otros 92, no", y "Es un link de rastreo de emBlue… termina llevando a: https://www.argentina.gob.ar/seguridad/emergencias/elnino".

**Destinos:**
- emBlue con `___url___`, emBlue con base64 y Google `/url?q=` se leen bien.
- Mailchimp sin destino escrito avisa que es rastreo.
- Un link común (mercadopago.com.ar con `redirect?pref_id=`) no muestra destino falso.

En la tabla, de los 9 casos cambian de nivel 3 (1 y 3 motores, y 1 sospechoso con dominio nuevo), más el caso real. Los demás quedan igual. El código guardado en n8n se comparó byte a byte con el probado: es idéntico.

## Para verificar con el próximo mensaje real
- Que el AI Agent copie "🟡 … Riesgo MEDIO" tal cual. Su prompt dice que los estados son "BAJO / SOSPECHOSO / ALTO" y que no invente uno intermedio, así que podría cambiar MEDIO por SOSPECHOSO (sigue en amarillo). Si pasa, sumar "🟡 Riesgo MEDIO" a la regla "EL SEMÁFORO SE COPIA EXACTO" del prompt.
- Observación: en el link real, el parámetro `t` en base64 dice `argentino.gob.ar`, distinto del destino del parámetro `data` (`argentina.gob.ar`). Vera muestra el de `data`, que es el que se usa para redirigir. No se mencionó la diferencia al cliente.

## Propuesto (no hecho)
- Verificar también el destino con VirusTotal. No se hizo porque gasta una consulta más del plan gratis (4 por minuto). Hoy el agente puede encadenar la herramienta si el cliente lo pide.
- `analizar_imagen` no se tocó. Ahí los motores no deciden el nivel, solo se listan.
