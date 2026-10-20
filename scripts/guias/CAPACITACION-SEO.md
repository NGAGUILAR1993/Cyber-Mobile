# Capacitación de la agente seo-guias: visitas que terminan en clientes

**Pedido del dueño (20/10/2026):** capacitar a la agente SEO con el criterio de las mejores expertas del mundo para que crezcan las visitas y, sobre todo, las pruebas de Vera. Sin clientes el proyecto no sigue. Leé esto antes de cada tarea, junto con la sección SEO de `CLAUDE.md`.

**Referentes:**
- **Aleyda Solís:** consultora española, una de las voces más reconocidas del SEO internacional. Publica la "AI Search Optimization Checklist" (actualizada en mayo de 2026), el podcast Crawling Mondays y LearningSEO.io.
- **Lily Ray:** E-E-A-T (experiencia, pericia, autoridad y confianza) y cómo cambia la búsqueda con las respuestas de IA.

Lo que sigue son sus principios aplicados a Cyber Mobile, no citas textuales.

## 1. Prioridad: lo que ya está cerca
Primero se mejora lo que Google ya nos muestra; después se escribe lo nuevo.
- En Search Console, las consultas con impresiones en los **puestos 5 a 20** son las más baratas de subir: ajustar título, primer párrafo, un subtítulo con la frase exacta y enlaces internos.
- Las consultas de los puestos 20 a 80 que ya aparecen (por ejemplo, "qué hacer si fui víctima de phishing", puesto 79) piden una guía propia que las responda de punta a punta.
- Cada guía nueva sale de una búsqueda real con intención clara. Nada de temas "porque sí".

## 2. Intención: responder lo que la persona necesita ahora
- **Urgencia** ("me robaron", "fui víctima", "transferí a un estafador"): pasos de la primera hora, numerados, con a quién llamar. Es la intención que más cerca está de probar Vera.
- **Verificación** ("cómo saber si es estafa", "de quién es un CBU"): la respuesta en las 2 primeras líneas y, enseguida, "mandáselo a Vera y te dice en segundos".
- **Información** ("qué es phishing"): definición corta, un ejemplo argentino real y enlace a la guía de verificación.

## 3. Escribir para Google y para las respuestas de IA
La lista de Aleyda Solís (versión de 2025) evalúa: recuperación por fragmentos, síntesis de respuestas, que el contenido merezca ser citado, amplitud del tema, contenido multimedia, autoridad, resistencia a la personalización y que el sitio se pueda rastrear. Aplicado a las guías:
- **Cada sección se sostiene sola:** un H2 con forma de pregunta y la respuesta directa en 40 a 60 palabras justo debajo. Los buscadores con IA citan fragmentos, no páginas enteras.
- **Que merezca la cita:** datos propios con fecha (ranking del Observatorio, casos que analizó Vera) y fuentes oficiales nombradas (BCRA, ANSES, ARCA, PAMI, Ministerio Público Fiscal). Es lo que no tiene la competencia.
- **Amplitud del tema:** tratar las estafas como un grupo de páginas enlazadas: guía ↔ ficha del Observatorio (`/observatorio/<slug>`) ↔ guía de verificación ↔ portada.
- **Multimedia:** una captura real tapada por guía, con un `alt` que la describa.
- **Rastreo:** HTML estático y sin bloquear los bots de IA (hoy `robots.txt` permite todo salvo `/redes/`). No bloquear GPTBot, PerplexityBot ni Google-Extended sin decidirlo con el dueño.

## 4. E-E-A-T: que se note quién está detrás
- **Autor real** en cada guía, con una bio corta y verificable (formación, experiencia en ciberseguridad) y una página "Quiénes somos". Pedirle los datos a Germán por "Necesita a Germán": nada inventado.
- **Experiencia de primera mano:** "Vera analizó este mensaje" con la captura real vale más que cualquier texto genérico.
- **Fecha de actualización** visible, y revisión de cada guía cada 90 días.
- **Datos estructurados:** `Organization` con `sameAs` (Instagram, TikTok) en la portada, que hoy solo tiene Instagram, y `Article` con autor y fecha en cada guía.

## 5. Autoridad: que otros nos nombren
- El **Observatorio** es nuestro imán de enlaces: un informe mensual citable por periodistas, con un dato fuerte en el título.
- Las salidas en radio y prensa (agente relaciones) se piden con link a `/observatorio` o a la guía del tema.
- Instituciones que pueden enlazarnos: municipios, centros de jubilados, bibliotecas, universidades y cámaras de comercio. Se proponen en "Oportunidades".
- Para la visibilidad en IA no alcanza con nuestras páginas: cuenta que nos mencionen sitios de terceros.

## 6. Convertir la visita en prueba
- CTA a Vera arriba (después de la respuesta) y al final, con `/vera?o=guia`.
- Una "caja de verificación" al principio de cada guía: "¿Te llegó algo así? Reenviáselo a Vera por WhatsApp" (sin JavaScript).
- Medición: clics `guia` en Redis por día y, por guía, clics en Search Console. Una guía con visitas y sin clics a Vera se reescribe arriba.

## 7. Medir cada semana
- Search Console: impresiones, clics, CTR y puesto promedio de las 20 consultas principales, comparados con la semana anterior.
- **Visibilidad en IA (mensual):** hacerles a ChatGPT, Gemini, Perplexity y AI Overviews de Google 10 preguntas fijas ("cómo saber si un mensaje es estafa en Argentina", "de quién es un CBU", etc.) y anotar si nos citan.
- Velocidad en el celular: hoy 73; meta 90. Imágenes livianas y nada que bloquee la carga.

## 8. Ritmo
- Martes y jueves: una guía nueva de la lista "Faltan" de `CLAUDE.md`.
- Lunes, miércoles y viernes: subir lo que está cerca (punto 1), enlaces internos, datos estructurados y una idea de enlace externo.
