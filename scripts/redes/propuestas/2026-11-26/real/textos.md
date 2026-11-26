# Caso 26/11: Falso mail de ARCA por "aranceles aduaneros" (encomienda internacional + foto del DNI)

## Caso
- Modalidad: Phishing de ARCA (/observatorio/phishing-arca).
- Mail apócrifo con el logo y los colores de ARCA: dice que una encomienda asociada al DNI está retenida, detalla aranceles por $198.092 (derechos de importación, tasa de estadística, IVA, recargos), da 3 días hábiles y pide una foto del DNI respondiendo el mismo correo.
- ARCA lo calificó de "mail apócrifo" y aclaró que ninguna gestión aduanera legítima pide foto del documento por mail. El 05/11/2026 volvió a alertar por una nueva ola (mails con deuda/trámite pendiente) y pidió reenviar a phishing@arca.gob.ar.

## Imágenes (reales, completas)
- `mail-arca-falso.png`: el mail entero tal como lo publicó Infobae (la nota ya lo trae sellado "FALSO"; el DNI de la víctima ya estaba en blanco). Recorte de captura de página de Firecrawl, 858x1300 px (resolución 1x: para el reel conviene verlo a ~900 px de ancho, sin hacer zoom grande).
- `alerta-arca-grafica.png`: gráfica oficial del tuit de @ARCA_informa del alerta (mail miniatura con sello FALSO); solo apoyo, es chica.
- `full.png`: captura completa de la nota (insumo, no usar).

## Fuente
- Infobae, 05/11/2026, "Envían falsos mails con el logo de ARCA para pedir plata y robar datos: cómo detectar los fraudes": https://www.infobae.com/economia/2026/11/05/envian-falsos-mails-con-el-logo-de-arca-para-pedir-plata-y-robar-datos-como-detectar-los-fraudes/
- La imagen del mail proviene de la nota de Infobae del 24/06/2026 (la nota de noviembre la reutiliza como "antecedente"): https://www.infobae.com/economia/2026/06/24/alerta-por-correos-falsos-de-arca-sobre-encomiendas-internacionales-como-funciona-la-estafa-que-roba-datos-y-dinero/
- Alerta oficial: ARCA, cuenta @ARCA_informa en X (citada en la nota del 05/11).

## Por qué sirve (y límites)
- Artefacto completo y reconocible (mail entero con montos, plazo y pedido del DNI); modalidad sin usar (#7 de la lista); alerta oficial fresca (05/11) y ola vigente.
- Límite honesto: el MAIL concreto es de junio 2026 (fuera de los 60 días); lo reciente es la alerta oficial y la ola de mails. Además lleva el sello "FALSO" de Infobae/ARCA encima de la tabla (sirve como mensaje, pero tapa parte de los montos). Derechos de imagen: es material de un medio; citar fuente o pedir/usar solo con crédito.
- Paso siguiente (regla 16): mandar `mail-arca-falso.png` a Germán para que lo pase por Vera y devuelva la captura real; no armar pieza sin ella.
