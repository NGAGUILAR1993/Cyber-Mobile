# Encargo para el agente REDES — Reel "Los pasos" (estilo terror / Cif Halloween)

> Pedido directo del dueño (01/11). Prioridad alta. Cuando se trabaje la próxima pieza de redes,
> esta va primero. Es un reel de **impacto, creativo, serio** (no chiste), 30 s exactos.

## La referencia
La nueva propaganda de **Cif para Halloween**: arranca con **pasos** y, en clima de terror, se van
**viendo las manchas** por la casa. Suspenso que crece. Queremos esa sensación, pero con una **estafa**.

## La idea (analogía)
Un **matrimonio** (pareja mayor/adulta) va cayendo en una estafa por **una serie de pasos** encadenados,
mostrados como "rastros" de terror que se acumulan, hasta que **les roban la plata de la cuenta** después
de **hacer clic**. Los pasos previos, en orden, como huellas que aparecen:

1. Les **robaron las claves** (filtración / phishing anterior).
2. Los **llamaron** (falso soporte / falso banco).
3. Les mandaron **promociones y propagandas falsas** (ofertas, premios, "tu cuenta tiene un problema").
4. Un **mensaje con un link** → están por **hacer clic**.

Clima: cada paso deja un "rastro" (como las manchas de Cif) que el espectador ve crecer con tensión.

## El giro (lo que nos diferencia)
Cuando están por hacer clic / transferir, se hace un **"reversing"** (la escena rebobina: los rastros se
borran, el audio va para atrás). **Antes del clic**, le **mandan el mensaje a Vera**. Vera lo analiza y
responde con el **semáforo 🔴**. Cierre **feliz y en calma**: el matrimonio, aliviado, lee que **ya estaban
alertados** — no cayeron.

Mensaje de marca: "No somos otra cuenta de alertas: creamos una herramienta para que te enteres primero,
en tu teléfono." Detrás de Vera hay ciberseguridad, IA entrenada y el Observatorio.

## Reglas obligatorias (del dueño)
- **30 segundos exactos** (IG, canal de WhatsApp y, si se hace, TikTok). Transiciones lentas, texto que se
  alcance a leer.
- Estructura: **Portada** (incógnita, sin revelar) → **Puente** (los pasos, el problema crece) →
  **Entrega/giro** (el reversing + Vera) → **CTA único**: "Comentá **VERA** y te envío el link por privado
  (7 días gratis)". (ManyChat responde por DM.)
- **Tapar siempre** nombres, mails, números, caras y chats ajenos, incluidos los del estafador. El dominio
  falso inventado se puede mostrar.
- **Tono serio, de impacto, con color** (seriedad de marca 22/10). Nada de nombres en chiste.
- **Nada inventado** sobre lo que hace Vera. El semáforo y las capacidades son las reales.
- Que **parezca grabado de un celular real** / escena real, no maqueta (plantillas en
  `scripts/redes/grabacion/`). Si hace falta recrear mensajes, con datos tapados y dominios falsos inventados.

## Producción
- Reel 1080x1920, 30 s. Historia de acompañamiento. TikTok 30 s si entra en la grilla.
- Guion (voz en off opcional, sobria), lista de tomas, textos en pantalla y `textos.json` +
  `instagram.txt` + `whatsapp.txt` en `redes/<fecha>/`.
- Revisar cada cuadro (datos tapados, 30 s, CTA, semáforo correcto) antes de commit → PR → `seguridad`
  en verde → merge.

## Idea audaz pendiente de la directora creativa
Redes: tirá tus 10 ideas en `scripts/redes/IDEAS.md` sobre CÓMO ejecutar el clima de terror y el reversing
(sonido, color, ritmo), elegí la más potente y producila. La analogía y los 4 pasos son fijos (pedido del
dueño); la ejecución creativa es tuya.
