# Auditoría de gastos — Cyber Mobile (29/10)

> Objetivo: dejar de pagar al vicio. Mantener **solo lo que hace falta para que Vera funcione**
> durante la prueba de 30 días de las charlas, y pausar todo lo demás.

**Aclaración honesta:** no tengo acceso a tus facturas, así que los montos son estimaciones por
tramo. Al lado de cada servicio te digo **dónde ver el número real** (te lleva 15 minutos) y qué hacer.

---

## Lo que SÍ hace falta para que Vera atienda (no tocar)

| Servicio | Para qué | Dónde ver el costo | Nota |
|---|---|---|---|
| **Railway — n8n** | El cerebro de Vera (el flujo) | railway.app → proyecto → Usage | Corre 24/7. Es el gasto principal. |
| **Railway — Evolution API** | La puerta de WhatsApp de Vera | railway.app → Usage | Imprescindible para WhatsApp. |
| **Railway — Postgres** | Base de datos de n8n | railway.app → Usage | La usa n8n. No borrar. |
| **Railway — Redis** | Memoria, contadores, antiduplicados | railway.app → Usage | La usa el flujo. |
| **Vercel** | La web + las funciones de `api/` | vercel.com → Settings → Usage | **Plan gratis** (al 18/10 iba 75%). $0 si no te pasás. |
| **Dominio cybermobile.com.ar** | La web y los links | donde lo compraste (NIC.ar / registrador) | Pago anual, chico. |
| **Meta WhatsApp Business API** | Enviar/recibir en WhatsApp | business.facebook.com | **Gratis** dentro de las 24 h. Sin plantillas = $0. |
| **Gemini API** | El modelo de IA que piensa las respuestas | aistudio.google.com / Google Cloud | Se paga por uso. Con poco tráfico es casi $0. |
| **VirusTotal / Tavily** | Verificar links y buscar casos | virustotal.com / tavily.com | Capas gratis. Con este volumen, $0. |

**El gasto fijo real está casi todo en Railway.** Eso es lo que hay que mirar primero.

---

## Lo que probablemente se puede PAUSAR mientras validás

| Servicio | Para qué se usa | Por qué pausarlo ahora | Acción |
|---|---|---|---|
| **Higgsfield** | Generar los videos/reels | No hace falta para que Vera atienda. Si tenés un plan pago mensual y no estás generando videos todos los días, estás pagando de más. | Entrá a tu cuenta → Billing. Si hay plan pago, **bajalo a gratis o pausalo**. Cuando necesites un video puntual, lo activás ese mes. |
| **ElevenLabs** (voz) | Que Vera conteste en audio | Es un "lindo de tener", no esencial. Si está en plan pago, bajalo. | elevenlabs.io → Subscription. Pasá a **Free** salvo que uses mucho el audio. |
| **Supabase** | Era respaldo del video de bienvenida | Ya estaba pausado (20/10). | Confirmá que sigue **en pausa / plan gratis**. |
| **Railway — servicios viejos** | Restos del incidente ("Staff IA"), instancias de prueba, flujos viejos | Un servicio detenido puede seguir facturando almacenamiento. | En Railway, revisá que **solo corran los 4 de arriba**. Borrá/archivá lo demás. |

---

## Lo que te cuesta en consumo de Claude (no es Railway, pero suma)

Hoy corren varias tareas automáticas todos los días (pieza de redes diaria, TikTok automático,
equipo de agentes) que **producen contenido que todavía no ve casi nadie**. Eso gasta tu cuota de
Claude sin traer gente.

**Sugerencia:** mientras hacés la prueba de las charlas, **pausá** las tareas de contenido
automático y volcá esa energía (y ese consumo) a lo que trae personas de verdad. Las dejo listas
para pausar si me decís que sí:
- "Redes diario" (06:40) · "TikTok automático" (lun/mié/vie) · "Equipo: una tarea por día"
- Dejás activo: el monitor de caídas y lo que haga falta para que Vera funcione.

---

## Plan de corte (15 minutos, hoy)

1. **Railway → Usage:** anotá cuánto gastaste este mes y qué servicios corren. Mandame la captura y lo miramos juntos.
2. **Railway:** borrá/archivá todo servicio que no sea n8n, Evolution, Postgres o Redis.
3. **Higgsfield y ElevenLabs:** si hay plan pago, bajalos a gratis/pausa.
4. **Supabase:** confirmá que está en pausa.
5. **Claude:** decime y pauso las 3 tareas de contenido automático.

Con esto, lo único que seguís pagando es **lo mínimo para que Vera atienda en las charlas**. Nada al vicio.

> Cuando me pases la captura de Railway → Usage, te armo el número exacto de "cuánto te cuesta tener Vera viva por mes" y vemos si hay algo más para bajar.
