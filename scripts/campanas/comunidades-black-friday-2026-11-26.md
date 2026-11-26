# Black Friday en grupos y comunidades (26 y 27/11/2026): textos listos para pegar

> Para Germán (y para quien quiera ayudar: familia, aliados, centros de jubilados ya contactados). **Sin spam:** un mensaje por grupo, solo en grupos donde Germán ya participa o donde se permite compartir información útil, y siempre diciendo quién lo manda. Nada de cuentas falsas ni de publicar lo mismo en 30 grupos. Cada texto lleva su origen de `/vera` para medir en Redis.
> Datos del Observatorio verificados en `observatorio/datos.json` (26/11). Ver la gacetilla en `scripts/campanas/prensa/black-friday-2026-11-26.md`.

## 1. WhatsApp: grupos de familia, barrio, club o trabajo (origen `grupo`)
Se reenvía tal cual. Es el canal con más llegada: 5 de las 10 estafas del ranking de noviembre llegan por WhatsApp.

> Mañana es Black Friday. Les paso algo útil: en octubre la tienda online falsa fue la 2.ª estafa que más circuló en Argentina (Observatorio de Fraude Digital) y antes del Black Friday vuelve a subir.
> Antes de pagar:
> 1. Entren a la tienda escribiendo ustedes la dirección, no desde un anuncio ni un link que les mandaron.
> 2. Si les piden transferir a la cuenta de una persona, no.
> 3. ¿Dudan de un link? Reenvíenselo a Vera por WhatsApp y les dice en segundos si es estafa (7 días gratis): https://www.cybermobile.com.ar/vera?o=grupo
> Las señales completas: https://www.cybermobile.com.ar/guias/tienda-falsa-compras-online

## 2. Facebook: grupos de barrio, de jubilados o de compra y venta (origen `comentario`)
Primero leer las reglas del grupo. Si no se permiten links, publicar el texto sin el link y responder con él a quien pregunte.

> **Antes de comprar en Black Friday, revisen esto (dato del Observatorio de Fraude Digital)**
> Soy Germán Aguilar, de Cyber Mobile. Relevamos cada mes las estafas que circulan en Argentina. En octubre, la tienda online falsa fue la segunda más activa del país, y en la previa del Black Friday vuelve a subir.
> Cinco señales de una tienda falsa:
> • Precio que no aparece en la web oficial de la marca.
> • Descuento extra por transferir a la cuenta de una persona.
> • No figura el CUIT (se verifica gratis en ARCA, "constancia de inscripción").
> • Cuenta de Instagram nueva y con los comentarios cerrados.
> • Apuro: "quedan 2", "termina hoy".
> Si alguien duda de un link, me lo puede pasar o se lo puede mandar a Vera, nuestro verificador gratis por WhatsApp: https://www.cybermobile.com.ar/vera?o=comentario

## 3. Reddit (r/argentina, r/merval, r/BuenosAires): respuesta útil, no publicidad
r/argentina no permite autopromoción en publicaciones sueltas. La jugada correcta es **responder** en hilos donde alguien pregunta "¿es confiable esta página?" o en el hilo diario, diciendo quién sos. Buscar: `site:reddit.com/r/argentina "es confiable" página` o "black friday estafa" en el buscador de Reddit.

Respuesta modelo (adaptar al caso; siempre con la divulgación):
> Para saber si una tienda es trucha, fijate tres cosas: 1) que el CUIT que muestra exista y coincida con el nombre en la constancia de ARCA; 2) que la dirección sea la de la marca (entrá escribiéndola vos, no desde un anuncio); 3) si te ofrecen descuento por transferir a una persona, es la señal más fuerte. Si es .ar, en NIC Argentina ves desde cuándo existe el dominio.
> Divulgación: trabajo en Cyber Mobile; hacemos un observatorio de estafas (cybermobile.com.ar/observatorio) y un verificador por WhatsApp. En octubre la tienda falsa fue la 2.ª estafa que más circuló en el país.

Por qué Reddit: los estudios de citas en respuestas de IA (Semrush, Tinuiti/Profound 2025-2026) muestran a Reddit entre los dominios más citados por Perplexity y Google AI Mode, aunque con mucha variación entre semanas. Una respuesta útil y votada en un hilo que la IA cita vale más que un post promocional borrado.

## 4. LinkedIn y X de Germán (link directo al informe)
> Mañana es Black Friday. Según el Observatorio de Fraude Digital que hacemos en Cyber Mobile, la tienda online falsa fue la 2.ª estafa de mayor circulación de octubre en Argentina (92/100) y en la previa vuelve a subir. En el ranking internacional es la #1 de noviembre. 7 de las 10 estafas del Top de noviembre son de riesgo alto y 5 llegan por WhatsApp.
> Informe con la fuente de cada caso, libre para citar: https://www.cybermobile.com.ar/informe-fraude-digital
> Si cubrís consumo o tecnología y necesitás una fuente, escribime.

## Cómo se mide (al 03/12)
- Clics en Redis por origen: `grupo`, `comentario` (y `prensa` para los mails). Comparar con la semana anterior.
- Primeros mensajes nuevos a Vera el 26, 27 y 28/11 (pruebas que arrancan).
- Respuestas votadas en Reddit (si alguna queda arriba en un hilo de "es confiable").
