# Lugares para las charlas — Córdoba Capital

> Empezá por acá: son **Centros de Día municipales para adultos mayores** (fuente oficial:
> Municipalidad de Córdoba, marzo 2025). Tienen público cautivo, funcionan de lunes a viernes de
> 8 a 14 h y les sirve muchísimo este tema. Contactá 5 esta semana; con que 2 te digan que sí, ya tenés charlas.

## Centros de Día municipales (adultos mayores +60)

| Centro | Dirección (barrio) | Teléfono | Correo |
|---|---|---|---|
| CDD Belgrano | Heroínas de Ayohuma 3399, esq. Fernando Abramo — B° Belgrano | 351 805-7602 | cibelgrano2014@gmail.com |
| CDD Don Gaspar | Gino Galeotti 721 — B° General Bustos | 4336010 / 4336001 / 351 805-7491 | lacasadedongaspar24@gmail.com |
| CDD El Hornero | Bartolomé de Argensola 851 — B° Alta Córdoba | 4335107 / 351 209-0965 | elhornero@ymail.com |
| CDD Los Olmos Sur | Vicente Forestieri 4827 — B° Los Olmos Sur | 351 805-7934 | cdlosolmos@gmail.com |
| CDD Los Plátanos | Angelo Peredo 3296 — B° Los Plátanos | 4337325 / 351 507-1075 | losplatanos2014@outlook.com |
| CDD MJF de Moyano | Entre Ríos 333 — B° Centro | 4332471 / 351 805-7821 | hogarmariajusta2007@gmail.com |
| CDD PAAIC Corral de Palos | Cabo Ernesto Guastoni 3400 — B° Corral de Palos | 351 805-7777 | iniciativascorral@gmail.com |
| CDD PAAIC (Liceo III) | Rodolfo Walsh 3559 esq. Juan Luis Orrego — B° Liceo III Sec. | 351 209-1049 | prog.iniciativascomunitarias@gmail.com |
| CDD Paseo de las Artes | Pasaje Revol 80 — B° Güemes | 433-4284 | paseorevol@gmail.com |
| CDD Pequeña Residencia | Hualfin 1053 — B° Providencia | 351 327-7770 | pequeresidencia1053@gmail.com |
| CDD Refugio de Esperanza | Lola Mora 2525 — B° Va. Bustos | 351 209-0943 | centrodediarefugiodeesperanza@gmail.com |
| CDD Rincón de los Amigos | Av. Patria 1100 esq. Buchardo — B° Pueyrredón | 351 209-0864 | hogarrincondelosamigos@yahoo.com.ar |
| CDD Tucumán | Tucumán 252 — B° Centro | 351 610-3110 | hogartucuman252@gmail.com |
| CDD Villa Cabrera | Argañaráz 1602 — B° Va. Cabrera | 4337301 / 351 808-6792 | cd.villacabrera@gmail.com |
| CDD Yapeyú | Bailen 41 — B° Yapeyú | 433-9121 / 351 202-2786 | centrodediayapeyu@gmail.com |

> Coordinación general: Secretaría de Políticas Sociales, Municipalidad de Córdoba — 27 de Abril 784.

## Otros lugares (segunda tanda)
- **Centros de jubilados PAMI:** hay miles. Acercate a la **agencia PAMI** más cercana y pedí la lista de los centros de tu zona (o preguntá en pami.org.ar). Son ideales porque ya tienen capacitaciones y conectividad.
- **Bibliotecas populares** de Córdoba (CONABIP): suelen hacer actividades para la comunidad y adultos mayores. Buscá "bibliotecas populares Córdoba" y ofrecé la charla.
- **Centros vecinales** de tu barrio: la mayoría tiene grupo de adultos mayores.
- **Parroquias** con grupo de tercera edad.

---

## Cómo contactarlos

**Lo mejor es llamar o pasar personalmente.** Estos centros contestan más por teléfono/WhatsApp que por mail. Pedí hablar con **la coordinación / dirección** del centro.

### Guion para llamar o mandar por WhatsApp
> Hola, buen día. Me llamo Germán Aguilar, soy de Córdoba y trabajo en seguridad digital.
> Ofrezco una **charla gratuita** para los adultos mayores del centro sobre **cómo no caer en las
> estafas por WhatsApp y teléfono**, que están muy comunes. Dura 20 minutos y, además, les dejo
> una herramienta gratis para que se puedan cuidar solos. ¿Con quién puedo coordinar una fecha?

### Si te piden algo por mail
> **Importante:** el mail a un tercero sale SIEMPRE desde **info@cybermobile.com.ar** (la cuenta
> institucional de Zoho), firmado **"Mg. Germán Aguilar"**. Si querés, te lo dejo como borrador en
> Zoho para que lo apruebes y lo mandes. Texto sugerido:

> **Asunto:** Charla gratuita sobre estafas por WhatsApp para adultos mayores
>
> Estimados,
> Mi nombre es Germán Aguilar, trabajo en seguridad digital en Córdoba (Cyber Mobile). Les ofrezco
> una charla gratuita de 20 minutos para los adultos mayores del centro sobre cómo reconocer y
> evitar las estafas por WhatsApp, SMS y llamados, que hoy son muy frecuentes. Al final, cada
> participante se lleva una herramienta gratuita para verificar por sí mismo si un mensaje o un link
> es confiable. No tiene ningún costo ni se vende nada.
> Quedo a disposición para coordinar día y horario.
> Saludos cordiales,
> **Mg. Germán Aguilar**
> Cyber Mobile · info@cybermobile.com.ar · www.cybermobile.com.ar

---

## Medición
- Cada folleto lleva el QR con origen **`charla`**. Los clics se cuentan en Redis
  (`cm:vera:clics:<fecha>`, campo `charla`). Después de cada charla vemos cuánta gente entró.
- *(Nota: el origen `charla` empieza a contar aparte recién cuando se mergee el cambio de `api/vera.js`
  a producción. Hasta entonces el QR funciona igual, pero esos clics caen en "directo".)*
- Meta de la primera charla: **que la mitad de los presentes le escriba a Vera.**
