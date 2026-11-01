# Cómo cobrar Vera desde otros países (resuelto)

> Pedido del dueño (01/11): la extensión ya se usa en otros países. "¿Cómo me van a pagar? Resolvelo."
> Esto define el camino y los pasos exactos de Germán. No gasta plata hasta que haya un cliente.

## El problema
- Hoy el pago es **Mercado Pago (Argentina), en pesos, con débito automático**.
- MP sirve en Argentina (y algo en BR/MX/CL/CO/UY/PE), pero **alguien de España, EE.UU. o México no puede
  pagar en pesos** ni suele tener MP. Además, cobrar del exterior trae el lío de **impuestos/IVA de cada país**.

## La solución (decidida)
Dos vías según de dónde es la persona, detectadas solas por la extensión/web:

1. **Argentina → Mercado Pago** (como hoy). En pesos, débito automático, más barato acá.
2. **Resto del mundo → Paddle** (un *Merchant of Record*). Paddle:
   - Cobra con **tarjeta, PayPal, Apple/Google Pay** en la moneda de la persona.
   - **Es el vendedor legal**: se encarga del **IVA/impuestos de cada país** (clave para una empresa de una
     sola persona: no te tenés que registrar en 50 países).
   - Te **deposita a vos** una vez por mes vía **Payoneer** (funciona en Argentina) o transferencia.
   - Precio sugerido internacional: **USD 8/mes** individual (ajustable). Comisión de Paddle ~5% + USD 0,50.

**Por qué Paddle y no otro:**
- **Lemon Squeezy** (muy bueno) hoy tiene el **alta por lista de espera/invitación** y paga solo en USD;
  no sirve para arrancar ya.
- **Stripe** no permite cuentas de empresas **argentinas** (haría falta una LLC en EE.UU.: demasiado por ahora).
- **PayPal solo** es fácil pero **no** maneja los impuestos y **sacar la plata a Argentina es un dolor**.
- **Paddle** tiene **alta directa (self-serve)**, es Merchant of Record y **paga por Payoneer** → es el que
  se puede usar desde Argentina **hoy**.

## Pasos de Germán (una sola vez; sin esto no se puede cobrar del exterior)
1. Abrir cuenta en **Payoneer** (gratis) — para recibir los USD. (payoneer.com)
2. Abrir cuenta en **Paddle** (paddle.com, alta directa). Verificar identidad (DNI/CUIT) y **conectar Payoneer**
   como forma de cobro.
3. En Paddle, crear el producto **"Vera — plan internacional"**, suscripción mensual en **USD** (ej. 8).
   Paddle te da un **link de pago (checkout)**.
4. Pasarme ese **link de checkout** y, si querés activación automática, las **claves de API + el webhook**.
   Con eso dejo que, cuando alguien del exterior paga, su Vera quede **activa sola** (sin WhatsApp argentino).

## Lo que hago yo (sin esperar nada)
- La extensión y la web **detectan el país**:
  - Argentina → botón actual (WhatsApp + Mercado Pago, en pesos).
  - Otro país → plan en **USD** con el botón de **Paddle** (por ahora con un link configurable; cuando me
    pases el real, lo enchufo).
- Para los de afuera, Vera vive en la **extensión y la web** (no necesitan el WhatsApp +54). La vinculación
  del exterior será por **mail/clave**, no por WhatsApp.
- Backend de activación automática (webhook de Paddle → marcar la sesión como suscripta): queda listo para
  cuando tengas la cuenta de Paddle.

## Nota
Esto es una recomendación de negocio, no mueve plata ni abre cuentas por vos. El alta de Payoneer/Paddle y el
precio final los definís vos. Firma institucional para cualquier comunicación: **Mg. Germán Aguilar**.
