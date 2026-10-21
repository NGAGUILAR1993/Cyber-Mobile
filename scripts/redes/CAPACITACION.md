# Capacitación de la agente redes: marketing que trae clientes

**Pedido del dueño (20/10/2026):** capacitar a la agente redes con el criterio de las mejores expertas en marketing digital para que la cuenta traiga **clientes que pagan**, no solo vistas. Sin ingresos el proyecto no sigue. Leé esto antes de cada pieza, junto con `scripts/OBJETIVO.md`.

**Referentes:**
- **Vilma Núñez:** estrategia y ventas en español. Contenido con un objetivo comercial, embudo, propuesta de valor clara y recursos que la gente guarda.
- **Rachel Pedersen y Mari Smith:** video corto y redes. Gancho en los primeros 3 segundos, valor gratis, comunidad y colaboraciones.

Lo que sigue son sus principios llevados a Cyber Mobile, no citas textuales. Antes de usar una frase de ellas en una publicación, verificala.

## 1. Cada pieza tiene un trabajo en el embudo
Vista → clic en `/vera?o=<origen>` → prueba de 7 días → pago. Un reel lindo que no mueve a nadie de un escalón al siguiente no sirve.

| Tramo | Qué busca | Formatos | Cómo se mide |
|---|---|---|---|
| **Alcance** (gente nueva) | Que la manden por WhatsApp o DM | Juego "¿estafa o real?", POV de la vieja, ranking del Observatorio, humor | Envíos, alcance a no seguidores |
| **Confianza** | Que crean que Vera funciona | Caso real "Se lo mandé a Vera", grabación real del celular, detrás de escena | Guardados, comentarios, seguidores nuevos |
| **Venta** | Que prueben y paguen | Demo de 30 s de punta a punta, objeciones ("¿y si ya caí?", "¿cuánto sale?"), Pack Padres como regalo | Comentarios "VERA", clics `/vera?o=ig`, pruebas nuevas |

**Mezcla de la semana:** 3 piezas de alcance, 2 de confianza y 2 de venta. Hoy casi todo lo que hacemos es alcance y confianza. **Falta pedir la venta.**

## 2. A quién le hablamos: el que paga
- **Hija o hijo de 30 a 55 años** con padres grandes: es quien paga el Pack Padres ($20.000, 3 personas). Le vendemos tranquilidad: "que tu vieja no caiga".
- **Jubilada o jubilado:** usa Vera, pero casi nunca la compra solo. Le hablamos con respeto y sin infantilizar.
- **Quien vende o compra en Marketplace o Mercado Libre:** le preocupan los comprobantes truchos y los falsos compradores.
- **PyME o comercio:** la estafa le cuesta plata directa (plan Empresas). Esa venta la hace el agente comercial.

Cada pieza elige **un** protagonista. Si se le habla a todos, no le llega a nadie.

## 3. Gancho: los primeros 3 segundos
- El primer cuadro ya muestra el problema: el mensaje trucho real, la plata, la cara de duda (tapada). Nada de logo ni presentación.
- Texto grande arriba, máximo 7 palabras, que abra una pregunta: "¿Este mensaje de PAMI es real?", "Mi vieja casi transfiere $300.000".
- Puntuá cada gancho con `ig-reel` y `hookscore.py` antes de producir.

## 4. Retención en 30 segundos (regla del dueño desde el 20/10)
- Todos los reels y videos duran **30 s**: Instagram, canal de WhatsApp y TikTok. Hay tiempo para leer, y no hay que gastarlo en relleno.
- Algo cambia cada 4 a 6 s: zoom, señal nueva, golpe, respuesta de Vera.
- Ritmo de lectura: 2,5 palabras por segundo como máximo en pantalla.
- El final se conecta con el principio (loop): la última frase responde la pregunta de la portada.

## 5. Que la compartan: lo que más pesa
- Para Instagram, los **envíos por DM** son de las señales que más alcance dan fuera de los seguidores. Cada pieza tiene que tener un "a quién se lo mandarías".
- Cierre fijo de marca: "Mandale este video a tu vieja".
- Entregables que se guardan: "las 3 señales", "qué hacer en la primera hora", "el mensaje que nunca manda tu banco".

## 6. Prueba social real
- Pedir permiso a cada persona que pruebe Vera para usar su caso tapado y una frase suya. Un testimonio real vale más que diez placas.
- Mostrar números solo si son reales y medibles (por ejemplo, cuántos mensajes revisó Vera en el mes, si n8n lo puede contar).
- Si sale una nota en radio o prensa: recortarla y usarla ("Nos invitaron a LV12 a hablar de estafas").

## 7. Pedir la venta sin vergüenza
- El CTA único sigue: "Comentá VERA y te envío el link por privado (7 días gratis)".
- Una vez por semana, una pieza con la oferta explícita: qué incluye, precio, que se cancela desde Mercado Pago y que los primeros 7 días son gratis.
- Fechas que venden: CyberMonday (noviembre), Navidad ("regalale Vera a tus viejos"), aguinaldo. Las campañas con descuento o sorteo se proponen en "Necesita a Germán": no se publican sin su aprobación.

## 8. Comunidad y colaboraciones
- Responder todos los comentarios en la primera hora (`ig-reply`): cada respuesta es otra chance de alcance.
- Proponer reels en colaboración (función Colaborar de Instagram) con cuentas locales: municipios, centros de jubilados, periodistas, comercios. Se proponen; no se mandan sin aprobación.
- Historias diarias con encuesta o pregunta: mantienen viva la relación con los seguidores que ya tenemos.

## 9. Medir y matar
- Cada lunes, por pieza: alcance a no seguidores, envíos, guardados, comentarios "VERA" y clics `/vera?o=ig` (Redis `cm:vera:clics:<fecha>`).
- Un formato que en 2 semanas no trae envíos ni clics se deja y se reemplaza.
- El número que manda es **pruebas nuevas por semana**. Meta del 15/11: 50 pruebas y 5 pagos.

## 10. Plan de 30 días para traer clientes
1. **Semana 1:** serie "Se lo mandé a Vera" con casos reales. Pieza de venta: demo de 30 s de punta a punta (llega el mensaje, se lo reenviás a Vera, semáforo, qué hacer).
2. **Semana 2:** campaña "Cuidá a tus viejos": el hijo le instala Vera a la madre. Pack Padres como protagonista.
3. **Semana 3:** colaboraciones locales y recortes de las salidas en radio (si se dan).
4. **Semana 4:** CyberMonday: oferta aprobada por Germán y cuenta regresiva en historias.
