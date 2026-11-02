# Informe de competencia — StopCiberestafas (España)

> Pedido de Germán (01/11). Sitio analizado: https://stopciberestafas.com/ · 02/11/2026.
> Germán ya les escribió para explorar complementarse. Este informe sirve también para esa charla.

## (a) Qué es y cómo funciona
- **Iniciativa comunitaria, independiente y gratuita** de prevención del fraude digital **en España**. Contacto: info@stopciberestafas.com. Sin empresa detrás visible; se banca con **donaciones** (Ko-fi).
- Es un **detector web**: pegás un enlace, SMS, teléfono o **IBAN** (o una captura) y en segundos te da un **puntaje de riesgo /100** y un **semáforo**, sin registrarte y sin costo.
- Tiene una sección **"Noticias / Alertas diarias"** ("Repositorio Nacional de Alertas"): avisos de seguridad **diarios** que levantan automáticamente de los feeds de **OSI/INCIBE** (phishing, smishing, quishing, vishing). Es su motor de contenido y SEO.
- Es una **PWA**: botón "Instalar App" (se agrega al celular/PC sin pasar por tienda).
- **Cómo analiza** (lo dicen ellos): procesamiento **local en el navegador** (privacidad): OCR local, lectura de **QR (jsQR)**, validación de **IBAN por Módulo 97**, detección de **homógrafos/Punycode (Unicode)**, y un **motor semántico (NLP)** que clasifica SMS por tipo de amenaza. Del lado del servidor consulta **feeds de inteligencia**: PhishTank, URLhaus, ThreatFox, Google Safe Browsing, PhishStats, AlienVault OTX, OpenPhish, abuse.ch, Spamhaus DROP, etc. Tiene **"memoria semántica" autoentrenada** (cada estafa crítica confirmada se suma al corpus).
- Panel de admin ("Cerebro") con analítica de audiencia, reglas, firewall anti-DDoS y un apartado para **"copiar resumen para partners / anunciantes"** y descargar CSV: dejan ver que piensan monetizar por **sponsors/anunciantes** más adelante. El boletín por mail está **suspendido**.
- Están **recién arrancando**: los contadores muestran **0 análisis / 0 € en pérdidas evitadas** "desde que empezamos". Alojado en **Railway** (igual que nosotros).

## (b) Ventajas / qué hacen bien
1. **Cero fricción:** detector instantáneo, sin registro y sin costo. Entrás y lo usás.
2. **Alertas diarias** automáticas desde feeds oficiales (INCIBE): mucho contenido fresco → bueno para SEO y para parecer "autoridad".
3. **Muchos feeds de inteligencia** cruzados en cada análisis (no solo un antivirus): PhishTank, URLhaus, ThreatFox, Safe Browsing, OpenPhish, Spamhaus…
4. **Privacidad como bandera:** "tus datos se procesan local, no viajan". Genera confianza.
5. **Módulos especializados:** QR (quishing), IBAN (Módulo 97), homógrafos/Punycode. Se ven "forenses".
6. **PWA instalable** y **contadores de impacto** (análisis hechos, pérdidas evitadas) como prueba social.
7. **Relato técnico/forense** ("auditoría", "especificaciones técnicas") que transmite seriedad.

## (c) Desventajas y huecos (nuestra ventaja)
1. **No es un agente que conversa.** Es un formulario/detector: no te habla, no te explica, no te sigue el caso. **Vera sí**: es una asistente que te responde como una persona.
2. **No tiene WhatsApp.** Son solo web + mail (y el boletín suspendido). La gente —sobre todo los grandes— vive en WhatsApp, que es donde **llega** la estafa. Vera está ahí.
3. **Motor estático/heurístico**, no una IA entrenada conversacional. No lee la **pregunta** que viene con la foto ni razona el contexto como Vera (Gemini + herramientas).
4. **No analiza audios/notas de voz.** Vera sí.
5. **Sin modelo de ingresos claro:** donaciones + esperanza de sponsors. Riesgo de sustentabilidad. Nosotros ya tenemos **suscripción paga** (y ahora internacional).
6. **Enfocado 100% en España** (INCIBE, AEAT, DGT, Correos, IBAN/SEPA): no sirve para Argentina (CBU/CVU, ARCA/ANSES/PAMI). Somos **complementarios por geografía**.
7. **Sin packs/familia ni seguimiento humano.** Recién arrancan (0 usuarios): es el momento de aliarse antes de que alguien domine.

## (d) Qué podemos COPIAR (accionable para Vera)
1. **Sumar feeds gratuitos de amenazas** al análisis de links de Vera, además de VirusTotal: **PhishTank, URLhaus, ThreatFox, OpenPhish, Spamhaus DROP, Google Safe Browsing**. Son gratis o baratos y **se ven** lindo en la terminal nueva de la extensión ("consultando PhishTank… URLhaus… ok").
2. **Alertas diarias**, no solo el Observatorio mensual: una sección/feed con alertas **diarias** de estafas de Argentina/región (levantadas de feeds). Más contenido = más SEO y más razones para volver.
3. **Módulo de QR (quishing):** decodificar el QR de una captura y analizar el link. Hoy no lo hacemos puntual.
4. **Homógrafos/Punycode:** detectar dominios con letras cirílicas/engañosas (bancо≠banco). Barato y potente.
5. **PWA "Instalar app"** para `/agente`: que se puedan agregar Vera al celular sin tienda.
6. **Mensaje de privacidad** explícito: "lo que verificás no se guarda ligado a vos".
7. **Contadores de impacto** ("X consultas · $X en pérdidas evitadas") cuando tengamos volumen: prueba social.
8. **Relato "forense/auditoría"** para reforzar "mostrá la ciberseguridad real detrás" (ya empezamos con la terminal de la extensión).

## (e) Qué TENER EN CUENTA (riesgos / diferenciación)
- Son **gratis**: pueden instalar la idea de que "esto se hace gratis". Nuestra respuesta no es competir en precio, es **otra cosa**: Vera no es un formulario, es **una asistente en tu WhatsApp** que te habla, lee audios y capturas y te sigue el caso. *"No somos otra cuenta/detector de alertas: creamos una herramienta que te contesta."*
- Los **feeds son los mismos para todos** (ellos y nosotros podemos usarlos). El diferencial no son los feeds: es la **IA conversacional + WhatsApp + el contexto argentino + la familia**.
- No copiar lo específico de España (IBAN/INCIBE) literal: **adaptar a Argentina** (CBU/CVU, organismos locales).
- Están **muy temprano** (0 usuarios): la velocidad importa, y una alianza temprana conviene a los dos.

## (f) Cómo COMPLEMENTARNOS (para la charla que abriste)
Ellos = **motor de inteligencia + alertas + feeds + alcance en España**. Nosotros = **la herramienta que le contesta a la gente (Vera) + WhatsApp + Argentina/LatAm**. Opciones, de menor a mayor compromiso:
1. **Intercambio de inteligencia:** compartir datos de estafas confirmadas (su "memoria semántica" ↔ nuestro Observatorio + lo que detecta Vera). Los dos mejoran sin gastar.
2. **Reparto geográfico + derivación cruzada:** ellos cubren España, Vera cubre Argentina/LatAm. Ellos pueden ofrecer "para Latinoamérica, Vera"; nosotros derivamos a usuarios de España a ellos.
3. **Vera como capa conversacional de su detector:** que su web/panel pueda "preguntarle a Vera" vía nuestra API (o un botón "seguí en WhatsApp"). Marca blanca / integración.
4. **Co-marketing y contenido:** alertas compartidas, menciones mutuas, prensa conjunta (dos proyectos jóvenes que se potencian).
- **Cuidados:** ellos hablan de "partners/anunciantes" y de mostrar datos agregados. Alinear desde el principio **privacidad, de quién es la relación con el usuario y de quién son los datos**. Mantener nuestro **modelo pago** y nuestros datos nuestros.

## Resumen en una línea
Son un **buen detector web de alertas para España, gratis y bien armado, pero sin agente que converse, sin WhatsApp y sin modelo de ingresos**. Nos conviene **copiarles los feeds, las alertas diarias, el QR y la PWA**, **diferenciarnos por la IA conversacional en WhatsApp**, y **aliarnos** (inteligencia compartida + reparto España/LatAm), porque estamos los dos arrancando y nos potenciamos más juntos que compitiendo por los mismos feeds.
