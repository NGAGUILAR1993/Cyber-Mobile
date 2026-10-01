# Conectar la verificación de la app con n8n

La app **nunca** habla directo con n8n. El recorrido es:

```
App Cyber Mobile ──HTTPS──▶ /api/app/verificar (Vercel) ──HTTPS + firma HMAC──▶ webhook de n8n
```

Vercel valida el dato, limita la cantidad de consultas por IP, firma el pedido y lo
reenvía a n8n. Mientras n8n no esté configurado, la app muestra "verificación no
disponible" y ofrece WhatsApp: **nunca inventa un resultado**.

## 1. Crear el webhook en n8n

1. Nuevo workflow → nodo **Webhook**, método `POST`, respuesta "Using 'Respond to Webhook' Node".
2. En las opciones del Webhook activá **Raw Body** (hace falta para verificar la firma).
3. Copiá la **Production URL** (empieza con `https://`).

## 2. Configurar Vercel

En Vercel → proyecto `cyber-mobile` → Settings → Environment Variables (Production):

| Variable | Valor |
| --- | --- |
| `N8N_VERIFY_URL` | La Production URL del webhook |
| `N8N_SHARED_SECRET` | Un secreto aleatorio de **al menos 32 caracteres** (por ejemplo, la salida de `openssl rand -hex 32`) |

Guardá el mismo secreto en n8n como credencial o variable (`CM_SHARED_SECRET`). Después,
redeploy del proyecto en Vercel para que tome las variables.

## 3. Lo que recibe n8n

Cabeceras:

| Cabecera | Contenido |
| --- | --- |
| `X-CM-Timestamp` | Segundos Unix del momento del envío |
| `X-CM-Signature` | `hex(HMAC_SHA256(secreto, timestamp + "." + cuerpo))` |
| `X-CM-Request-Id` | Identificador de la consulta (también va en el cuerpo) |

Cuerpo (JSON):

```json
{
  "id": "5a678d45-05f9-4234-93d3-e514ac10b97f",
  "tipo": "link",
  "valor": "https://pami-tramites-online.com/login",
  "origen": "app",
  "version": "0.1.0"
}
```

`tipo` es uno de: `link`, `cbu` (22 dígitos o alias), `telefono` (solo dígitos y `+`),
`email` (en minúsculas) o `mensaje` (texto libre, hasta 4000 caracteres). El servidor ya
validó y normalizó `valor`.

## 4. Verificar la firma (primer nodo después del Webhook)

Nodo **Code** (JavaScript). n8n tiene que permitir el módulo `crypto`
(`NODE_FUNCTION_ALLOW_BUILTIN=crypto` en la configuración de n8n).

```js
const crypto = require('crypto');
const secreto = $env.CM_SHARED_SECRET;            // o una credencial de n8n
const h = $json.headers;
const ts = h['x-cm-timestamp'];
const cuerpo = $json.body_raw ?? JSON.stringify($json.body); // con Raw Body activado
const esperada = crypto.createHmac('sha256', secreto).update(`${ts}.${cuerpo}`).digest('hex');
const firma = String(h['x-cm-signature'] || '');
const ok = firma.length === esperada.length &&
  crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
const vigente = Math.abs(Date.now() / 1000 - Number(ts)) < 300;   // 5 minutos, evita reenvíos
if (!ok || !vigente) throw new Error('Firma inválida');
return [{ json: typeof $json.body === 'string' ? JSON.parse($json.body) : $json.body }];
```

Si la firma no coincide, el workflow corta y Vercel responde un error genérico a la app.

## 5. Lo que tiene que devolver n8n

Nodo **Respond to Webhook**, código 200, JSON:

```json
{
  "veredicto": "peligro",
  "titulo": "Link falso que imita a PAMI",
  "explicacion": "El dominio fue registrado hace 3 días y copia el diseño del sitio oficial.",
  "recomendaciones": [
    "No ingreses datos personales ni bancarios.",
    "Bloqueá el número que te lo envió."
  ]
}
```

| Campo | Valores | Notas |
| --- | --- | --- |
| `veredicto` | `seguro`, `precaucion`, `peligro`, `desconocido` | Cualquier otro valor se muestra como `desconocido` |
| `titulo` | texto, hasta 120 caracteres | Si falta, la app usa uno según el veredicto |
| `explicacion` | texto, hasta 1500 caracteres | Lenguaje claro, sin tecnicismos |
| `recomendaciones` | lista de hasta 6 textos de hasta 300 caracteres | Pasos concretos |

Tiempo máximo de respuesta: **25 segundos**. Si n8n tarda más, la app muestra
"tardó demasiado" y ofrece reintentar.

## 6. Privacidad en n8n

- No guardes `valor` más tiempo del necesario (la política de privacidad dice 30 días como máximo).
- No lo envíes a servicios que no figuren en la política de privacidad.
- Si registrás estadísticas para el Observatorio, guardá solo la modalidad y el canal, nunca el dato.
