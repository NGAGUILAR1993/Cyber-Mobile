# Cambio 03/11: más fuentes de inteligencia en el análisis de links (V43b)

Pedido de Germán (03/11), idea del informe de competencia StopCiberestafas (`scripts/competencia/2026-11-02-stopciberestafas.md`, punto d1): que el veredicto de links no dependa solo de VirusTotal y se note "la ciberseguridad real detrás".

Flujo "CYBER MOBILE 2026_10 - V38" (`fFoGJZEQRy0g6Dt1`).

- **Versión publicada (activa):** `b98673de-f13d-49d0-bf3c-33a8bd824e07` ("V43b: fix jsCode (path correcto) + intel").
- **Versión anterior (para volver atrás):** `0a08a20f-c027-4bac-a661-0ab1965568eb` (V42, precios 01/11). Para revertir: `publish_workflow` con ese `versionId`.
- Solo se tocó el nodo **`verificar_url_virustotal`** (código de la herramienta). No se tocó el prompt del AI Agent ni ningún otro nodo.

## Qué se sumó (gratis y SIN API key)
Dos fuentes nuevas, consultadas **en paralelo** con RDAP y Tavily (dentro del mismo `Promise.all`), así no agregan latencia al camino crítico:

1. **Cloudflare (DNS sobre HTTPS, sin key).** Se compara el resolvedor normal (`cloudflare-dns.com`, 1.1.1.1) con el de ciberseguridad (`security.cloudflare-dns.com`, 1.1.1.2). Si el dominio **resuelve en el normal pero el de seguridad lo manda a `0.0.0.0`**, es que la inteligencia de amenazas de Cloudflare lo bloquea (malware/phishing). Un resolvedor de seguridad no sinkholea un sitio legítimo: es señal fuerte y confirmada. (Si el normal también da `0.0.0.0` o no resuelve, es dominio muerto, no bloqueo: no cuenta.)
2. **PhishStats (API REST pública, sin key).** Consulta **filtrada por el dominio** (`/api/phishing?_where=(url,like,~dominio~)`); **no se descarga ninguna lista entera**. Solo cuenta como coincidencia si el host del resultado es **exactamente** este dominio (así un phishing alojado en otro subdominio no mancha al dominio legítimo).

## Cómo afectan el veredicto (refuerzan, no reemplazan)
- **Bloqueo de Cloudflare** → 🔴 Riesgo ALTO (veredicto confirmado por un resolvedor de seguridad).
- **Coincidencia en PhishStats + otra señal** (dominio < 30 días, denuncia pública o algún motor de VirusTotal) → 🔴 Riesgo ALTO.
- **Coincidencia en PhishStats sola** → 🟡 Riesgo MEDIO (SOSPECHOSO).
- Si VirusTotal no tiene informe, estas señales también suben el nivel (mensajes dedicados "SITIO BLOQUEADO POR UN RESOLVEDOR DE SEGURIDAD" / "SITIO EN BASE DE PHISHING").
- El reporte **siempre muestra** las dos fuentes nuevas ("Resolvedor de ciberseguridad (Cloudflare): bloquea / no lo bloquea", "Base de phishing (PhishStats): N coincidencias / sin coincidencias"), aunque estén limpias: es parte de mostrar el trabajo de ciberseguridad.
- El "Qué hacer" ahora sigue el **nivel final** (riesgo), no solo los motores: un ALTO por Cloudflare/PhishStats da el consejo fuerte ("no lo abras"), no el leve.
- **La lógica V42 queda intacta** (umbral por cantidad de motores 0 / 1-4 / 5+, destino de links de rastreo, RDAP, denuncias). Nada de 24 h ni plantillas pagas.

## No rompe nada (degradación)
Cada consulta nueva está envuelta en `try/catch` con timeout corto (Cloudflare 7 s, PhishStats 8 s). Si una falla, no responde o devuelve algo raro, queda en "no consultado" y el veredicto es exactamente el de VirusTotal/V42. Ninguna señal nueva puede romper el análisis.

## Cómo se probó (antes de publicar)
Se corrió el código **exacto guardado en n8n** (extraído de la versión publicada) en Node, con VirusTotal, RDAP, Tavily, Cloudflare y PhishStats simulados, en 10 escenarios. Resultado:

| Escenario | V42 | V43b |
|---|---|---|
| Link limpio (VT 0, cf no bloquea, ph 0) | 🟢 BAJO | 🟢 BAJO |
| Cloudflare bloquea (VT 0) | 🟢 BAJO | 🔴 ALTO |
| PhishStats hit solo (VT 0, dom viejo) | 🟢 BAJO | 🟡 MEDIO |
| PhishStats hit + dominio nuevo (VT 0) | 🟢 BAJO | 🔴 ALTO |
| argentina.gob.ar 1/93 motores (regresión) | 🟡 MEDIO | 🟡 MEDIO |
| VT 5 maliciosos (regresión) | 🔴 ALTO | 🔴 ALTO |
| Sin informe VT + Cloudflare bloquea | 🟡 sin verificar | 🔴 ALTO |
| Sin informe VT + PhishStats + nuevo | 🟡 sospechoso | 🔴 ALTO |
| Endpoints de intel fallan (limpio) | 🟢 BAJO | 🟢 BAJO (degrada) |
| Doble señal (cf bloquea + ph hit) | 🟢 BAJO | 🔴 ALTO |

Cambian de nivel 6 de 10, todos casos de estafa o reforzados; los limpios, las regresiones de V42 y la degradación por fallo quedan igual. No hay falsos positivos nuevos en los casos limpios.

**Nota operativa:** el primer `update` escribió el código en `parameters.parameters.jsCode` (campo anidado inerte, path mal rooteado) y el nodo seguía corriendo V42; se detectó al verificar y se corrigió reemplazando el objeto `parameters` completo (V43b). Para editar el `jsCode` de un `toolCode` con `setNodeParameter`, el path es relativo a `parameters` (usar `/jsCode`, no `/parameters/jsCode`).

## Para verificar con el próximo mensaje real
- Confirmar que desde n8n (Railway) responden `cloudflare-dns.com`, `security.cloudflare-dns.com` y `phishstats.info` (desde este entorno no se pudieron probar en vivo por política de red; por eso el `try/catch` que degrada). Mirar una ejecución real con un link y chequear que aparezcan las líneas "Resolvedor de ciberseguridad (Cloudflare)" y "Base de phishing (PhishStats)".
- La tarjeta de la red ("Armar Tarjeta Red") sale solo con 🔴: ahora un link bloqueado por Cloudflare o en PhishStats+contexto también puede generar tarjeta. Es el comportamiento buscado (link realmente peligroso).
- El prompt del AI Agent copia el semáforo exacto; los niveles nuevos reutilizan el formato "🟡 … Riesgo MEDIO" / "🔴 … Riesgo ALTO" que V42 ya usaba, así que no hay riesgo nuevo de que lo reescriba.

## Propuesto (NO hecho — necesitan API key, quedan para Germán si quiere)
Estas fuentes mejorarían aún más el cruce pero piden credencial (no se activaron para respetar "nada técnico de tu lado"); el cambio publicado funciona sin ninguna clave:
- **URLhaus / ThreatFox (abuse.ch):** desde 2025 su API pide un **Auth-Key gratuito** (crear cuenta en auth.abuse.ch → generar Auth-Key → cargarlo como credencial/secreto en n8n). Lookup de URL/host muy bueno.
- **Google Safe Browsing (Lookup API):** key gratuita desde Google Cloud Console (habilitar "Safe Browsing API" → crear API key).
- **PhishTank:** requiere registro/clave de aplicación (hoy con registro limitado).
- Más adelante, **mostrar estas fuentes en la terminal de la extensión** ("consultando Cloudflare… PhishStats… ok"), como hace StopCiberestafas, para que se vea el trabajo en vivo.
