# Cyber Mobile: memoria del proyecto

> **Objetivo vigente:** 100 clientes pagos de Vera al 31/12/2026 y viralidad. Ver `scripts/OBJETIVO.md`.

Leé esto al empezar cada sesión. Resume qué es el proyecto, cómo funciona cada automatización, las reglas que pidió el dueño y lo que quedó pendiente. Mantenelo al día cuando algo cambie.

## Qué es
- **Cyber Mobile** (Argentina) ofrece **Vera**, un agente de IA antiestafas.
  - **WhatsApp:** +54 9 11 7059-8505.
  - **Web:** /agente.
  - Revisa links (VirusTotal), CBU/CVU, mails filtrados, teléfonos, capturas, archivos, perfiles y audios. Responde con un semáforo 🔴🟡🟢 y qué hacer.
- **Observatorio de Fraude Digital** (/observatorio): ranking mensual de estafas en Argentina.
  - n8n actualiza `observatorio/datos.json` y abre un deploy automático.
  - Cada estafa tiene su ficha en `/observatorio/<slug>` (`api/estafa.js`).
- **Planes:** prueba de 7 días gratis.
  - Individual $12.000, Pack Padres $20.000 (3 personas), Pack Familiar $40.000 (5 personas).
  - Empresas: $60.000 hasta 10 personas, $125.000 hasta 25.
  - Débito automático por Mercado Pago; se cancela desde la app de MP → Suscripciones.
- **Dueño:** Germán (habla en español rioplatense). Mail de trabajo: cybermobile.ai@gmail.com.

## Arquitectura
- **Web:** sitio estático en Vercel con funciones en `api/` (ESM) y Redis (ioredis). Rutas y encabezados de seguridad en `vercel.json`. Dominio: www.cybermobile.com.ar.
- **n8n** (Railway, `primary-production-3c8ba.up.railway.app`):
  - Flujo principal **activo: "CYBER MOBILE 2026_10 - V38"** (id `fFoGJZEQRy0g6Dt1`).
    - Versión publicada el 19/10: **V39b**. Vera solo cita dominios que se ven escritos en la captura e ignora los servidores de imágenes. Detecta apps falsas dentro de Google Play o App Store por el desarrollador y las descargas (patrón `app_falsa_tienda`, con tarjeta propia) y contesta la pregunta que viene con la foto. Pendiente menor en `analizar_imagen`, `numDescargas`: "500 mil" se lee como 500 millones; corregir el orden del regex a `(milm|mil|mm|b|m|k)` la próxima vez que se edite ese nodo.
  - También: "CYBER MOBILE - Agente Web" y "Notificaciones MercadoPago".
  - Hay un **conector de n8n** en claude.ai: con él se ven ejecuciones y se edita y publica el flujo directamente (`update_workflow` + `publish_workflow`). **No hace falta mandarle JSON al usuario para importar.**
- **WhatsApp:** Evolution API (`evolution-api-production-bf51.up.railway.app`), instancia "Agente Ciber". Es la **API oficial de WhatsApp Business (Meta)**:
  - Solo se pueden mandar mensajes libres a quien escribió en las **últimas 24 h**.
  - Para los demás haría falta una plantilla de Meta, que es paga: el dueño decidió no usarla (ver Pendientes).
  - `/chat/whatsappNumbers` no existe en esta API (devuelve 400).
- **Tarjetas para WhatsApp** (`api/tarjeta.js`, PNG 1080x1350, se arman en el momento):
  - `/tarjetas/semana-AAAAMMDD.png`: alerta del lunes con el #1 del ranking de `observatorio/datos.json` (ya no depende del flyer que arma GitHub). El texto lo da `/api/alerta-semanal` (reescrito a `api/tarjeta.js?modo=alerta`).
  - `/tarjetas/caso/<datos>.<firma>.png`: "Estafa detectada" con el tipo y hasta 3 señales que encontró Vera. Solo la genera n8n: va firmada con HMAC (`N8N_SHARED_SECRET` = `CM_SHARED_SECRET`). El texto se limpia dos veces (n8n y la web): sin links, números largos, mails ni @usuarios.
  - Lo que lee una función tiene que estar fuera de `/scripts/`, `/app/` y `/docs/` (`.vercelignore` no los publica): por eso la tipografía Anton está copiada en `tarjetas/fuentes/` y las frases cortas viven en `observatorio/claves.json`.
  - Si la tarjeta nueva no responde, n8n usa la fija `tarjetas/alerta-red.jpg` (caso) o el flyer de GitHub (lunes).
- **Límite de Vercel: 12 funciones** en `api/` (sin contar `_lib`). Hoy hay 12: para sumar una, juntarla con otra y usar un rewrite (como `/api/stats` → `api/observatorio-stats.js?vista=eventos`). Si se pasa, el deploy falla al instante y las rutas nuevas dan 404.
- **Consumo de Vercel (plan gratis, 18/10 avisó 75%):**
  - `ignoreCommand` en `vercel.json`: no se hace deploy si el commit solo toca `scripts/`, `app/`, `docs/`, `.github/`, `.claude/`, `CLAUDE.md` o `README.md` (no cambian el sitio).
  - La rama `claude/...` no genera vistas previas (`git.deploymentEnabled`): solo se publica al hacer merge a main.
  - `admin.html` consulta `/api/stats` cada 60 s y solo con la pestaña a la vista (antes, cada 5 s siempre).
  - `/redes/` lleva caché de un día en el navegador.
- **Link corto:** `/vera?o=<origen>` → wa.me con texto armado. Cuenta los clics por origen en Redis (`cm:vera:clics:<fecha>`). Orígenes: ig, bio, comentario, tarjeta, qr, web, canal, historia, guia, alerta, tiktok, estado; y desde el 20/10, para la campaña Viralizar: ong, prensa, latam, en, ph, grupo, creador.

## Automatizaciones (qué corre solo)
| Qué | Dónde | Cuándo |
|---|---|---|
| Alerta semanal (tarjeta del #1 del ranking, armada en el momento por `api/tarjeta.js`; flyer de GitHub de respaldo) a suscriptos + staff por WhatsApp | n8n, nodo "Trigger Alerta Lunes 19hs" → "Enviar Alerta WhatsApp" | Lunes 19:00 AR |
| Flyer de la alerta semanal (`redes/alerta-semanal/`, hoy solo respaldo e historia de Instagram) | `alerta-semanal.yml` (lunes) + respaldo en `redes.yml` | Lunes a la mañana |
| Pieza diaria para redes (`redes/<fecha>/`) | `redes.yml` → `scripts/redes/generar.mjs` | Todos los días 08:15 AR |
| Mail diario con la pieza del día a cybermobile.ai@gmail.com | Routine de claude.ai | 11:22 AR |
| Control de la alerta del lunes (revisa en n8n, reenvía si falló, manda mail) | Routine "Control alerta semanal (martes 12 h)", ligada a la sesión original | Martes 11:52 AR |
| Monitor de caídas (sitio, agente, n8n, Evolution y el video de bienvenida en Supabase; mail solo si cambia el estado) | `monitor.yml` | Cada 30 min (GitHub suele atrasarlo) |
| Controles de seguridad | `seguridad.yml` | Cada push a main y cada PR |
| Mail a cybermobile.ai@gmail.com cada vez que sale una tarjeta de la red (tipo, señales, imagen; cliente con los últimos 4 dígitos) | n8n, "Preparar Mail Tarjeta" → "Mail Tarjeta Enviada" (SMTP de info@cybermobile.com.ar) | Cada tarjeta |
| Mail con el resumen de la alerta del lunes (a cuántos salió, fallos, tarjeta) | n8n, "Preparar Mail Alerta" → "Mail Alerta Enviada" | Lunes, después del envío |
| Video de TikTok "¿Estafa o real?" (genera, publica en la web, prepara la subida a TikTok y avisa por mail) | Tarea programada "TikTok automático", ligada a la sesión original (así tiene Gmail y Higgsfield) | Lun, mié y vie 18:10 AR |
| Pieza diaria de redes en el estilo claro, sin repetir (reemplaza a la de `redes.yml`) | Tarea programada "Redes diario" (la idea la pone el agente redes), ligada a la sesión original | Todos los días 06:40 AR |
| Equipo: UNA tarea por día con UN agente (mar y jue, la guía SEO), con registro en el Centro de Mando. Pedido del dueño 19/10: gastar poco y dejarle lugar | Tarea programada "Equipo: una tarea por día" (las de SEO, comercial y relaciones quedaron pausadas) | Lun a vie 08:10 AR |
| Envío de la alerta por GitHub (solo respaldo **manual**) | `alerta-envio.yml` | A mano (requiere los secretos EVOLUTION_APIKEY y ALERTA_DESTINOS, hoy no cargados) |

Los horarios automáticos de GitHub se atrasan mucho en este repo: el monitor corre cada ~8 h en lugar de cada 30 min. No confiar en ellos para envíos a hora exacta: lo exacto va en n8n.

## Plan de redes nuevo (aprobado por el dueño el 16/10)
- Plan completo en `scripts/redes/PLAN-2026-10.md` (diagnóstico, grilla nueva, interacción diaria, perfil, medición a los 7 y 14 días).
- **Estilo nuevo:** fondo claro, chats de WhatsApp en modo claro, notas blancas arriba, Vera respondiendo con el semáforo dentro del chat y cierre "Mandale este video a tu vieja". Se dejan las placas oscuras de alerta. Primer reel: `redes/2026-10-16/reel-pov-mama/`. TikTok ya usa este estilo.
- **Plantillas del estilo claro:** `scripts/redes/estilo-claro/` (carrusel juego "5 trampas" y reel POV).
- **Pieza diaria creativa:** tarea programada "Redes diario" (06:40 AR, ligada a la sesión original). Le encarga la pieza al agente redes, que la inventa y la produce sin repetir nada de los últimos 30 días. La tarea la revisa y la publica antes de que corra `redes.yml` (08:15), que saltea el día porque ya existe `textos.json`.
- **Por qué:** `scripts/redes/generar.mjs` tiene piezas fijas que se repiten (por ejemplo, "IA general vs Vera" sale igual cada dos sábados; el 17/10 se repitió). Queda solo como respaldo.

## Grilla de redes vieja (`scripts/redes/generar.mjs`, guía en `scripts/redes/GUIA.md`)
| Día | Pieza | Hora |
|---|---|---|
| Lun | Reel "Se lo mandé a Vera" (caso real) + historia de la alerta de la semana | 20:00 |
| Mar | Carrusel "Radar del Observatorio" | 19:30 |
| Mié | Reel "¿Estafa o real?" + historia con encuesta | 20:00 |
| Jue | Historia de planes | 13:00 |
| Vie | Reel "Vera te enseña" / "IA general vs Vera" (semana por medio) | 20:00 |
| Sáb | Carrusel "IA general vs Vera" / "Guardalo para tu familia" + historia de preguntas | 12:00 |
| Dom | Libre | |

- Si `redes/<fecha>/textos.json` ya existe, la pieza automática de ese día no se genera. Sirve para cargar piezas especiales.
- `--caso <id>` arma un reel "Se lo mandé a Vera" con un caso puntual de `scripts/redes/casos.json`. Las capturas van en `scripts/redes/casos/`, siempre con los datos personales tapados.
- Los videos especiales se suben a `redes/<fecha>/<nombre>/` para poder mandar el link por mail. Los archivos de más de ~7 MB no se adjuntan: se mandan links a la web y a GitHub.

## Reglas del dueño (respetar siempre)
1. **Todos los reels y videos duran 30 segundos:** Instagram, canal de WhatsApp y TikTok (regla del dueño desde el 20/10, para que se puedan leer bien; antes eran 25 y 26). Transiciones lentas y textos con tiempo para leerse.
2. **Estructura de cada pieza:**
   - **Portada:** abre una incógnita y no revela la respuesta.
   - **Puente:** amplía el problema.
   - **Entrega:** algo que se guarda o se comparte.
   - **CTA único:** "Comentá VERA y te envío el link por privado (7 días gratis)". ManyChat responde por DM.
3. **Tapar siempre** mails, nombres, números, caras y chats ajenos en las capturas, incluidos los datos del estafador. El dominio falso se puede mostrar.
4. **No tomar sus palabras literalmente:** son ideas para mejorar. Implementar directo, con criterio de marketing.
5. **Mensaje de marca:** "No somos otra cuenta de alertas: creamos una herramienta para que te enteres primero, en tu teléfono." Detrás de Vera hay ciberseguridad, IA entrenada, automatizaciones y herramientas especializadas.
6. **Comparaciones con otras IA:** ser justos ("son útiles para muchas cosas; para estafas conviene una especialista"). Las marcas (ChatGPT, Gemini) van solo en el texto de la publicación, nunca en las imágenes.
7. **No pedirle que cargue cosas técnicas** (secretos, importar JSON): quiere que salga solo. Si algo es indispensable de su lado (por ejemplo, la plantilla de Meta), explicar el paso exacto.
8. **Mandar los entregables por mail** a cybermobile.ai@gmail.com cuando lo pida.
9. **Todo mail a terceros (medios, empresas, clientes) sale desde info@cybermobile.com.ar**, la cuenta institucional de Zoho (conector de Zoho Mail, cuenta `7816472000000008002`), nunca desde Gmail (pedido del dueño, 20/10). Los borradores para aprobar también van en Zoho (`ZohoMail_sendEmail` con `mode: "draft"`). **Firma de Germán en todo mail y documento: "Mg. Germán Aguilar"** (Cyber Mobile · info@cybermobile.com.ar · www.cybermobile.com.ar).

## TikTok
- Guía completa en `scripts/redes/TIKTOK.md`: perfil, público, estilo, series y frecuencia (lunes, miércoles y viernes 20:00).
- CTA propio: "Link en el perfil · 7 días gratis" (en TikTok no hay ManyChat). Link del perfil: `/vera?o=tiktok`.
- **Automático:** tarea programada "TikTok automático" (lun, mié y vie 18:10 AR) → `scripts/tiktok/generar.mjs` (serie "¿Estafa o real?", episodios en `scripts/tiktok/episodios.json`) → web → TikTok. Germán solo confirma el formulario: TikTok no deja publicar sin su aprobación.
- Se publica con el conector de Higgsfield (cuenta conectada el 15/10). El dueño confirma en el formulario.
  - El sandbox no llega a `upload.higgsfield.ai`. Por eso el video se sube primero al repo (`redes/<fecha>/<nombre>/`) y, después del merge, se importa desde la web con `media_import_url` (usar `?v=N` si dio 404 antes del deploy).
  - El link de Higgsfield es `https://d2ol7oe51mr4n9.cloudfront.net/user_3Hhk6wBXukaieqWmzGUm4XH7K22/<media_id>.mp4`. Después se llama a `tiktok_prepare_publish`.

## Equipo de agentes (`.claude/agents/`)
- **marketing:** la estratega. Decide qué hacer y cómo se mide (embudo, campañas, pruebas, métricas) y reparte el trabajo entre redes, seo-guias, comercial y relaciones.
- **redes:** la directora creativa, capacitada en marketing que vende (`scripts/redes/CAPACITACION.md`, 20/10). Inventa las ideas (investiga tendencias, tira 10 ideas por pieza en `scripts/redes/IDEAS.md`, elige la más audaz) y las produce, con ambición de crecer en seguidores. Pedido del dueño (17/10): las ideas tienen que salir de ella, no del dueño.
- **seguridad:** revisa cada PR (claves, CSP, funciones de `api/`). Solo lee, no edita.
- **vera-n8n:** diagnostica y corrige el flujo de Vera con el conector de n8n.
- **seo-guias:** escribe y publica las guías de `/guias`, capacitada en SEO y búsqueda con IA (`scripts/guias/CAPACITACION-SEO.md`, 20/10).
- **comercial:** ventas directas (PyMEs, LinkedIn, seguimiento de pruebas) para la meta del 15/11.
- **relaciones:** prensa, alianzas, influencers, campañas por fecha, sorteos y reputación de la firma.
- **Viralización con libertad (pedido del dueño, 20/10):** "viralizar como sea, llegar a todo el mundo; si en Argentina no alcanza, salir de la caja". El agente marketing tiene permiso para buscar y ejecutar opciones de viralización y expansión (otros países, otros públicos, alianzas) sin pedir aprobación previa, con estos límites: no gastar plata, nada de comprar seguidores, bots, spam masivo ni cuentas falsas, nada inventado, y los mails a terceros desde info@ con su firma. Plan y avances en `scripts/campanas/` (plan del 20/10: `scripts/campanas/2026-10-20-viralizar.md`; ese día salieron desde info@ 10 mails a asociaciones de consumidores, Faro Digital, Factchequeado y Maldita).
- **Autonomía (pedido del dueño, 19/10), con límite de consumo:** una sola tarea por día de lunes a viernes a las 08:10, con un solo agente elegido por impacto (martes y jueves, la guía SEO). No lanzar varios agentes a la vez: el dueño necesita lugar para usar la sesión. Redes y vera-n8n mantienen su tarea fija. Horarios y límites en `scripts/OBJETIVO.md`.
- **Centro de Mando** (desde el 22/10, pedido del dueño: "un dashboard real, fácil de trabajar y controlar los agentes"): https://claude.ai/artifact/MrVapjWdcaF42rFj6HVauL. Panel en vivo con base de datos (`ArtifactData`): colecciones `agentes` (estado activo/pausado: una tarea de un agente pausado no corre), `ordenes` (órdenes del dueño, se hacen primero), `aprobaciones` (Necesita a Germán, se aprueba con un botón), `actividad` (la bitácora), `oportunidades` y `metricas`. Formato completo en "El Centro de Mando" de `scripts/OBJETIVO.md`. Todo lo que hace cada agente, y lo que se hace a pedido del dueño en esta sesión, va a `actividad`. Los mails a terceros quedan como borradores en Zoho. El documento viejo de Claude Docs (`21ab2d66-...`) queda solo como historia.
- Se usan pidiéndolos por nombre ("usá el agente seguridad") o con `/agents`. `.claude/` no se publica en la web (`.vercelignore`).

## Skills de Instagram (`.claude/skills/ig-*`)
- Paquete de terceros revisado y fijado a una versión (ver `.claude/skills/README-instagram-agent-skill.md`).
- Sirven para:
  - puntuar ganchos de reels (`ig-reel`, `hookscore.py`);
  - revisar captions antes del corte "… más" (`ig-caption`);
  - auditar el perfil (`ig-profile`) y las métricas (`ig-audit`);
  - responder comentarios (`ig-reply`) y DMs (`ig-dm`);
  - investigar qué funciona en el nicho (`ig-viral`).
- Las reglas de este archivo tienen prioridad sobre las de las skills.

## Seguridad (DevSecOps)
- **Nunca** commitear exportaciones de n8n ni claves. Los JSON del flujo tienen claves de API en vivo; el control `scripts/seguridad/revisar.mjs` lo bloquea.
- **Antes de pedir merge,** `seguridad.yml` tiene que estar en verde:
  - gitleaks (binario fijo con SHA-256);
  - controles propios;
  - guías y bloque de la portada iguales a su fuente;
  - `npm audit`.
- **Páginas estáticas nuevas:** sin JavaScript ejecutable, CSP estricta en `vercel.json` y escapar todo el texto.
- **Pendiente recomendado:** rotar las claves de Mercado Pago, Meta y Evolution, que circularon en archivos JSON.
- **Commits y PRs:** no incluir identificadores de modelo. Flujo de trabajo: rama `claude/web-improvements-cyber-app-kq7rww` → PR → esperar `seguridad.yml` → merge.

## SEO (plan basado en el reporte de Bunzy)
- **Guías en `/guias`:**
  - Fuente: `guias/guias.json`. Generador: `scripts/guias/generar.mjs`.
  - Salida estática: `guias/<slug>/index.html`, `guias/lista.json` y el bloque de la portada entre las marcas `guias:inicio` y `guias:fin`.
  - El sitemap (`api/sitemap.js`) las incluye solas.
- **Publicadas:** verificar-estafa-whatsapp, que-es-phishing, verificar-numero-desconocido (13/10); de-quien-es-un-cbu (17/10); como-saber-si-es-estafa (18/10, incluye la sección "Las estafas por WhatsApp más comunes en Argentina"); que-hacer-si-fui-victima-de-phishing (20/10). Desde el 20/10 el generador acepta links `[texto](/ruta)` o a dominios oficiales de una lista cerrada (gob.ar, gov.ar, mercadopago.com.ar, whatsapp.com, ftc.gov) y pone la caja de Vera arriba, después de la respuesta.
- **Títulos y descripciones (18/10):** se reescribieron para subir el CTR (título ≤60, descripción ≤155, palabra buscada adelante, "gratis"/2026/Argentina cuando aplica) en las guías, `/guias`, la portada y `/observatorio`. Mantener esos largos en las guías nuevas.
- **Automático:** tarea programada "SEO: libre" (lunes a viernes 10:10 AR, ligada a la sesión original). Martes y jueves publica la próxima de "Faltan" y manda un mail con el link para pedir la indexación en Search Console; los otros días hace mejoras de SEO.
- **Search Console 20/10 (28 días: 179 impresiones, 6 clics, puesto 15,4):** la guía del CBU ya aparece ("a quién pertenece" puesto 1; "con el CBU puedo saber de quién es la cuenta" puesto 8) y "phishing" puesto 3. Aparecemos lejos en "qué hacer si fui víctima de phishing" (79), "fraude en compras online" (39) y "sobre inversiones" (6). La marca "cyber mobile" sale 4.ª: falta reforzarla (datos estructurados de organización con Instagram y TikTok).
- **Faltan** (2 o 3 por semana; primero las que Search Console ya muestra, después por búsquedas):
  - inversiones falsas: cómo reconocerlas (#2 del Observatorio; "sobre inversiones" en el puesto 6);
  - fraude en compras online / tienda falsa (puesto 39);
  - estafas por WhatsApp más comunes (1.000): guía aparte, lista larga de modalidades con un ejemplo y qué hacer en cada una; que enlace a como-saber-si-es-estafa, que ya tiene una sección corta con ese subtítulo.
  - denunciar estafa por WhatsApp (480);
  - cómo saber si un email es falso (320);
  - cómo saber si un link es seguro (140);
  - cómo saber si una cuenta bancaria es confiable (140);
- **Competencia:** mediavox.co (puesto 18) y detect.ar (puesto 14) para "verificar estafa whatsapp argentina".
- **Hecho (21/10):** en de-quien-es-un-cbu se sumó la pregunta frecuente literal "¿Con el CBU puedo saber de quién es la cuenta?" (primera del FAQ). En la portada, `Organization` ya tenía `logo` y `contactPoint` con el WhatsApp de Vera; **falta sumar TikTok a `sameAs`**: el usuario no está confirmado (`scripts/redes/TIKTOK.md` dice `@cybermobile.ar` o, si estaba tomado, `@vera.antiestafas`). Cuando Germán confirme el usuario, agregar `https://www.tiktok.com/@<usuario>`.
- **Base de comparación:** SEO 71, visibilidad en IA 55, velocidad en celular 73. Volver a correr el análisis gratis de Bunzy unas 3 semanas después del 13/10.
- **Search Console:** es una propiedad de dominio, así que el sitemap se envía con la URL completa `https://www.cybermobile.com.ar/sitemap.xml`. Hay una entrada vieja mal cargada (`sitemap.xml](...`) que conviene borrar.

## Estado al 20/10 (traspaso de la sesión original)
- **Sesiones (desde el 20/10):** las tareas automáticas corren en la sesión "Cyber Mobile · Operaciones" (`session_01MxYYsnjkKK9JefcQK7TQcs`, con Gmail, n8n, Claude Docs, Higgsfield y GitHub). La sesión original (`session_01Fx8nG8n9zT2oynar78L9kM`) queda libre para el dueño; sus tareas viejas quedaron apagadas. Donde este archivo dice "ligada a la sesión original", hoy es la de Operaciones.
- **Tareas programadas** (ids para `update_trigger`, todas en Operaciones): Redes diario `trig_0169854CEhxh1PpEPSUtiaKE` · TikTok automático `trig_01TsfWL4KwNAGocaDwgxqkw4` · Equipo: una tarea por día `trig_01Syyjz1Sf6LpdUiS419Zvzi` · Vera conversión (mié) `trig_01Cq6J6pXdPz7tB4nxZUAaYe` · Seguridad (vie) `trig_01XB8NnmXu2vMmGKeWzBNzg4` · Control alerta (mar) `trig_014hpQrV2WqPQ2CoDAXomPG8` · Mail pieza del día (11:22, sesión nueva cada vez con Gmail) `trig_01TVTmoHNQKmXc4Nj2dH8cyo`. Pausadas (sesión original): Comercial `trig_014nRTL9a2s8eXG5LBsSyC9d`, Relaciones `trig_01N5xRBSQu8gk9eZkGGcerpm`, SEO `trig_013WcfiVn5HWPtHzwCCkD3Nb`.
- **Piezas listas:** 20/10 "El Observatorio" (cierre "Animate a escribirle · 7 días gratis"; el dueño pidió que saliera ese día) y 21/10 "¿Ese link de PAMI es estafa?" (recorridos de la web real, `redes/2026-10-20/` y `redes/2026-10-21/`, todo en 30 s; el TikTok del 21, ahora el de PAMI, lo toma la tarea automática). Herramientas en `scripts/redes/grabacion/` (plantilla de grabación de celular y grabación de la web real). Pedido del dueño: piezas que parezcan grabadas de un celular, nada de maquetas.
- **TikTok:** quedan 2 episodios sin publicar en `scripts/tiktok/episodios.json`; la próxima corrida agrega 3.
- **Rechazado por el dueño (19/10):** concurso "la madre más desconfiada" y la serie/personaje "La Vieja Invicta".
- **Diario Época:** nota sobre un papá al que le vaciaron la cuenta tras bajar una app (es el #1 del Observatorio, "App de acceso remoto"). Se le mandaron al dueño el mail y el DM para el diario; él los envía.
- **Embudo (19/10):** en 7 días ninguna persona nueva le escribió a Vera; 0 pagos. Campaña "Primeros 10" en `scripts/campanas/2026-10-19-primeros-10.md`. Los botones de prueba de la web ya pasan por `/vera?o=web`; falta una vista para leer los clics de Redis (propuesta: `?vista=vera` en `api/observatorio-stats.js` + tabla en `admin.html`).
- **Alerta del lunes:** el 19/10 n8n la "envió" a 7 números, pero Meta solo entrega a quien escribió en las últimas 24 h (imagen o texto, da igual; fuera de esa ventana solo plantillas pagas). Propuesto al dueño, sin respuesta: guardar el estado de entrega de Meta para saber a quién llegó, publicar la alerta en el canal de WhatsApp, y que Vera invite a escribir "ALERTA".
- **Seguridad:** el historial de ejecuciones de n8n guarda las claves del nodo "Config Secretos" en cada ítem; pendiente sacarlas y rotar las de MP, Meta y Evolution (espera aprobación en el Centro de Mando).
- **Consumo:** el dueño pidió (19/10) no gastar de más: un agente por vez y dejarle lugar en la sesión.

## Pendientes
- **Sin plantillas pagas de Meta (decisión del dueño, 14/10):** no se crean plantillas porque Meta cobra cada mensaje con plantilla y hoy no hay clientes pagos.
  - Todo lo que manda Vera es gratis: respuestas y tarjetas dentro de las 24 h desde que el cliente escribió.
  - La alerta del lunes también es gratis, pero solo le llega a quien le escribió a Vera en las últimas 24 h. No volver a proponer la plantilla hasta que haya clientes pagos.
- **Clientes:** hoy no hay suscriptos pagos. Prioridad comercial:
  - conseguir las primeras 30 personas que prueben Vera;
  - charlas en centros de jubilados y bibliotecas;
  - mail mensual del Observatorio a medios de Córdoba;
  - propuesta para PyMEs (documento "Propuesta Cyber Mobile para PyMEs" en Claude Docs);
  - contacto con Verisure y Prosegur por LinkedIn (textos ya entregados).
- **OBJETIVO (17/10): 100 clientes pagos al 31/12/2026 y que Cyber Mobile se haga viral.** Plan y trabajo fijo de cada agente en `scripts/OBJETIVO.md`. Hito intermedio: al 15/11, 50 personas que hayan probado Vera y 5 que paguen.
- **Video de bienvenida:** n8n ("Enviar Video Vera") lo manda por link desde Supabase (`swhwheusmyhaygfiypqs.supabase.co/storage/v1/object/public/Vera/vera.mp4`). El 20/10 no le llegó a un número nuevo porque el proyecto de Supabase (plan gratis) estaba pausado: Meta acepta el envío igual y falla después, sin error en n8n. El dueño lo restauró y el monitor lo consulta para mantenerlo activo y avisar si se cae.
- **Bienvenida de Vera:** el número del staff no ve el flujo real. Las pruebas de primer mensaje las hace un número que nunca escribió.
