# Lugares para las charlas — CABA (cerca de Caballito)

> Vivís en **Caballito (Comuna 6)**. Caballito no tiene Centro de Día municipal propio, así que los
> **más cercanos** están en las comunas que la rodean (Flores/Parque Chacabuco, Villa Crespo, Boedo).
> Empezá por estos 5 — están a pocos minutos — y en paralelo buscá los **centros de jubilados de tu
> barrio** con el mapa oficial (abajo), que son los que más te conviene por cercanía.

## Centros de Día municipales más cercanos a Caballito
(Fuente oficial: Gobierno de la Ciudad. Funcionan de lunes a viernes 9 a 15 h.)

| Centro | Dirección | Barrio / Comuna |
|---|---|---|
| Centro de Día Nº 28 | Picheuta 1517 | Flores — Comuna 7 (pegado a Caballito) |
| Centro de Día Nº 3 | Esteban Bonorino 897 | Parque Chacabuco — Comuna 7 |
| Centro de Día Nº 7 | Av. Juan B. Alberdi 2908 | Flores — Comuna 7 |
| Centro de Día Nº 15 | Jufré 346/350 | Villa Crespo — Comuna 15 |
| Centro de Día Nº 29 | Urquiza 2247 | Boedo / San Cristóbal — Comuna 4 |

**Cómo coordinar con estos:** la vía oficial es la **Línea 147 opción 5** o el mail
**personasmayores@buenosaires.gob.ar** (Dirección de Personas Mayores, GCBA). Decí que querés ofrecer
una charla gratuita de prevención de estafas para las personas mayores que asisten. También podés
**ir en persona** a cualquiera de estos centros y pedir hablar con la coordinación.

## Los que están EN Caballito (buscalos vos, son los mejores por cercanía)
Caballito tiene muchos **centros de jubilados PAMI**, **clubes** y **bibliotecas** con grupos de adultos mayores. Para los de tu cuadra:

- **Mapa oficial de Centros de Jubilados (GCBA):** entrá, poné tu dirección y te muestra los de alrededor →
  https://epok.buenosaires.gob.ar/mapasadmin/mapa_embebido/centros_de_jubilados
- **Zona Parque Centenario / Primera Junta:** hay varios centros de jubilados; aparecen en ese mapa.
- **Club Ferro Carril Oeste** (Av. Avellaneda 1240, Caballito): tiene actividades para adultos mayores; preguntá por el área social/tercera edad.
- **Bibliotecas populares de la Comuna 6:** suelen hacer actividades comunitarias. Buscá "bibliotecas populares CONABIP Caballito" u ofrecé la charla en la **sede de la Comuna 6** (gestión comunal).
- **Centros de jubilados PAMI:** acercate a la **agencia PAMI** más cercana a Caballito y pedí la lista de los de tu zona (o pami.org.ar / 138).
- **Parroquias de Caballito** con grupo de tercera edad.

> Mi recomendación: arrancá por el **mapa oficial** (te da los de tu propia cuadra) + **1 o 2 de los
> Centros de Día de arriba**. Con 5 contactos esta semana y 2 que te digan que sí, ya tenés charlas.

---

## Cómo contactarlos

**Lo mejor es ir en persona o llamar.** Pedí hablar con la **coordinación / dirección**.

### Guion para llamar, ir en persona o mandar por WhatsApp
> Hola, buen día. Me llamo Germán Aguilar, soy de Caballito y trabajo en seguridad digital.
> Ofrezco una **charla gratuita** para los adultos mayores sobre **cómo no caer en las estafas por
> WhatsApp y teléfono**, que están muy comunes. Dura 20 minutos y, además, les dejo una herramienta
> gratis para que se puedan cuidar solos. ¿Con quién puedo coordinar una fecha?

### Si te piden algo por mail
> **Importante:** el mail a un tercero sale SIEMPRE desde **info@cybermobile.com.ar** (Zoho),
> firmado **"Mg. Germán Aguilar"**. Si querés, te lo dejo como borrador en Zoho para que lo apruebes.

> **Asunto:** Charla gratuita sobre estafas por WhatsApp para adultos mayores
>
> Estimados,
> Mi nombre es Germán Aguilar, trabajo en seguridad digital en la Ciudad de Buenos Aires (Cyber
> Mobile). Les ofrezco una charla gratuita de 20 minutos para los adultos mayores sobre cómo
> reconocer y evitar las estafas por WhatsApp, SMS y llamados, que hoy son muy frecuentes. Al final,
> cada participante se lleva una herramienta gratuita para verificar por sí mismo si un mensaje o un
> link es confiable. No tiene ningún costo ni se vende nada.
> Quedo a disposición para coordinar día y horario.
> Saludos cordiales,
> **Mg. Germán Aguilar**
> Cyber Mobile · info@cybermobile.com.ar · www.cybermobile.com.ar

---

## Medición
- Cada folleto lleva el QR con origen **`charla`**. Los clics se cuentan en Redis
  (`cm:vera:clics:<fecha>`, campo `charla`). Después de cada charla vemos cuánta gente entró.
- *(El origen `charla` cuenta aparte recién cuando se mergee `api/vera.js` a producción. Hasta
  entonces el QR funciona igual, pero esos clics caen en "directo".)*
- Meta de la primera charla: **que la mitad de los presentes le escriba a Vera.**
