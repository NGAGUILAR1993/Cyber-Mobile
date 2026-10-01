# Vera en la web (`/agente`)

```
Navegador ──▶ /api/agente/* (Vercel) ──HTTPS + firma HMAC──▶ workflow "CYBER MOBILE - Agente Web" (n8n)
                     ▲                                                    │
                     └──── /api/agente/confirmar ◀── flujo principal de WhatsApp ("Vincular web CM-XXXXXX")
```

## Qué ofrece cada canal

| | Web | WhatsApp |
| --- | --- | --- |
| Links, CBU/CVU/alias, teléfonos, emails, archivos/APK, capturas, perfiles de redes | ✓ | ✓ |
| Texto de un mensaje | Señales básicas | ✓ |
| Análisis de patrones con IA y campañas activas, audios, seguimiento del caso, reenviar sin copiar, alertas semanales | — | ✓ |

## Cómo se cobra

- **2 consultas gratis por navegador** (cookie firmada) y **6 por IP por mes**. Las controla Vercel en Redis.
- Si la consulta falla, no se descuenta.
- Sin consultas gratis, la persona **vincula su WhatsApp**: la web le da un código `CM-XXXXXX`, lo
  envía a Vera y n8n avisa a `/api/agente/confirmar`. La cuenta es el número de WhatsApp.
- Con el WhatsApp vinculado y sin gratis, n8n confirma la suscripción en su Redis
  (`suscripcion:<número>` = `activo` o `prueba`, o número de staff). El pago sigue siendo el de
  WhatsApp: "Quiero suscribirme" → Mercado Pago.

## Puesta en marcha

1. **n8n**
   - Importar `CYBER MOBILE - Agente Web.json` como workflow nuevo y activarlo.
   - Importar la versión V28 del flujo principal (agrega la vinculación) sobre el actual, después de duplicarlo como respaldo.
   - Los dos traen `CM_SHARED_SECRET` en *Config Secretos*: tiene que ser el mismo valor en ambos y en Vercel.
2. **Vercel** → Settings → Environment Variables (Production):

   | Variable | Valor |
   | --- | --- |
   | `N8N_WEB_URL` | Production URL del Webhook del workflow "Agente Web" (`.../webhook/cm-agente-web`) |
   | `N8N_SHARED_SECRET` | El mismo `CM_SHARED_SECRET` de n8n |
   | `REDIS_URL` | Ya existe (lo usa el sitio) |

   Redeploy para que tome las variables. Mientras falten, `/agente` muestra que se está configurando y ofrece WhatsApp.
3. **Probar**: abrir `/agente`, hacer una consulta, agotar las 2 gratis, vincular el WhatsApp de staff y verificar que siga sin límite.
4. **Publicar**: sacar `<meta name="robots" content="noindex">` de `agente/index.html`, sumar `/agente` al sitemap y enlazarlo desde la home.

## Contrato con n8n

Pedido (cabeceras `X-CM-Timestamp`, `X-CM-Signature` = `hex(HMAC_SHA256(secreto, ts + "." + cuerpo))`):

```json
{ "id": "uuid", "origen": "web", "modo": "gratis | suscripcion", "telefono": "5493510000000",
  "tipo": "link | cbu | telefono | email | mensaje | archivo",
  "valor": "…",
  "archivo": { "nombre": "captura.png", "mime": "image/png", "tipo": "imagen | documento", "base64": "…" } }
```

Respuesta (también incluye el formato de la app: `veredicto`, `explicacion`, `recomendaciones`):

```json
{ "nivel": "alto | medio | bajo | desconocido", "puntaje": 94, "titulo": "…", "resumen": "…",
  "hallazgos": [{ "tipo": "peligro | alerta | ok", "texto": "…" }], "pasos": ["…"],
  "modalidad": { "nombre": "Phishing de PAMI", "slug": "phishing-pami" },
  "estadoSuscripcion": "activo" }
```

Sin acceso: `{ "acceso": "denegado", "estadoSuscripcion": "cortado" }`. Si el agente no responde, n8n devuelve 502 y la consulta no se descuenta.

`/api/agente/confirmar` recibe `{ "codigo": "CM-XXXXXX", "telefono": "…", "estado": "activo | prueba | staff | …" }` firmado igual.

## Seguridad y privacidad

- La web nunca habla directo con n8n; el secreto vive solo en Vercel y n8n.
- Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, limitada a `/api/agente`, firmada con una clave derivada del secreto.
- Límites por IP: 5 por minuto, 30 por hora, 80 por día. Archivos de hasta 3 MB; los audios se derivan a WhatsApp.
- Vercel no registra lo que se verifica; el workflow web no guarda ejecuciones exitosas.
- Si alguien envía un código de vinculación desde el WhatsApp de otra persona, esa persona recibe el aviso
  "si no fuiste vos, avisame". La sesión web solo permite consultar, no muestra datos personales (el número aparece enmascarado).
