# Objetivo de Cyber Mobile

**Fijado por el dueño el 17/10/2026.** Lo leen todos los agentes antes de trabajar. Cuando se cumpla, el dueño fija el siguiente: no se baja la ambición.

## La meta
1. **100 clientes pagos de Vera al 31/12/2026.**
2. **Que Cyber Mobile y Vera se hagan virales:** que la gente nos comparta, nos siga y nos recomiende sin que se lo pidamos.
3. **Ganancias:** cada acción se mide por cuánto nos acerca a clientes que pagan.

Hito intermedio (se mantiene): al 15/11, 50 personas que probaron Vera y 5 que pagan.

## Cómo se llega (embudo)
Vistas en redes y en Google → clics a `/vera?o=<origen>` → prueba de 7 días en WhatsApp → plan pago (Mercado Pago).

Todavía no medimos cuántos de los que prueban terminan pagando. Ese número es el primero que hay que conocer, porque define cuántas pruebas hacen falta. Si pagara 1 de cada 5, harían falta unas 500 pruebas hasta diciembre. Es un supuesto para corregir con datos reales, no un dato.

## Qué hace cada agente, y cuándo
Desde el 19/10, marketing, comercial, relaciones y seo-guias trabajan **con libertad, de lunes a viernes**: no esperan órdenes, eligen la acción de más impacto del día y la hacen. Redes y vera-n8n mantienen su tarea fija.

| Agente | Modo | Trabajo | Cuándo (hora AR) |
|---|---|---|---|
| **marketing** (jefa del equipo) | Libre | Lee el tablero, revisa lo de ayer, fija las 3 prioridades del día y le da una tarea a cada agente libre. Los lunes actualiza las métricas. Mail corto al dueño solo si hay algo para aprobar o un resultado importante. | Lun a vie 08:10 |
| **seo-guias** | Libre | Martes y jueves, una guía nueva. Los otros días: lo que más suba en Google (mejorar guías con impresiones, enlaces, fichas, ideas de backlinks). | Lun a vie 10:10 |
| **comercial** | Libre | Empresas, comercios e instituciones con el mensaje listo, propuestas y seguimiento de quienes probaron Vera. | Lun a vie 12:40 |
| **relaciones** | Libre | Prensa, alianzas con organizaciones, influencers y campañas por fecha, con los textos listos. | Lun a vie 15:10 |
| **redes** | Fija | Inventa y produce la pieza del día. | Todos los días 06:40 |
| **redes (TikTok)** | Fija | Video "¿Estafa o real?" listo para publicar. | Lun, mié y vie 18:10 |
| **vera-n8n** | Fija | Revisión del flujo de Vera: pruebas, pagos, errores y mejoras. | Miércoles 09:40 |
| **seguridad** | Fija | Revisión semanal del sitio y del repo. | Viernes 16:10 |

## El tablero del equipo (documento compartido)
Todo lo que hace cada agente, pedido por el dueño o por iniciativa propia, se anota en el documento **"Tablero del equipo Cyber Mobile"** (Claude Docs, id `21ab2d66-13c8-49a4-82bc-ca9030235d8a`, cuerpo `b9e506b6-e787`, link https://claude.ai/code/artifact/21ab2d66-13c8-49a4-82bc-ca9030235d8a). Tiene cinco secciones:
- **Necesita a Germán:** lo que espera aprobación. Estado: Pendiente, Aprobado, Rechazado o Hecho. El dueño lo cambia o deja un comentario; al día siguiente el agente lo toma.
- **Oportunidades:** organizaciones, empresas, medios e influencers, con su etapa (Idea → Investigando → Borrador listo → Contactado → En conversación → Cerrado o Descartado) y la siguiente acción.
- **Bitácora:** una fila por cosa hecha, la más nueva arriba (fecha, agente, origen Germán o Iniciativa, qué hizo, resultado o link).
- **Métricas de la semana:** las actualiza la jefa los lunes.

Cómo se escribe en el tablero: lo hace la tarea programada (la sesión principal), con el conector de Claude Docs, a partir de lo que entrega el agente. Primero `read` con `sinceRev` o una búsqueda para ver lo nuevo, después se agregan filas: nunca se reescribe ni se borra lo que puso el dueño. Antes de proponer algo, cada agente mira la bitácora para no repetir trabajo.

## Libertad, con estos límites
- **Sin pedir permiso:** investigar, armar listas de contactos públicos, escribir propuestas, comunicados, guías y piezas; mejorar la web (pasa por el control de seguridad); dejar mails para terceros como **borrador en Gmail** (`create_draft`), listos para que el dueño los mande.
- **Con aprobación del dueño (fila en "Necesita a Germán"):** escribirle a cualquier persona u organización de afuera, ofertas, descuentos, sorteos o promesas, y cualquier gasto.
- Si una fila quedó Aprobada, el agente la ejecuta al día siguiente y la pasa a Hecho.

## Reglas para todos
- Nadie le escribe a terceros por su cuenta: los mensajes para clientes, medios o empresas quedan como borrador en Gmail y en el tablero; el dueño los aprueba y los envía.
- Nada inventado: ni cifras, ni testimonios, ni promesas que Vera no cumpla.
- Nada de gastar plata sin aprobación del dueño.
- Las reglas de `CLAUDE.md` siguen valiendo.
