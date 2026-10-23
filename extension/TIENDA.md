# Vera Antiestafas para Chrome: ficha de la tienda y lanzamiento

Paquete para subir: `vera-chrome-<versión>.zip`. Se arma con `node scripts/extension/empaquetar.mjs`.
Funciona en Chrome, Edge, Brave y Opera de computadora. No hay versión para celular: el celular usa WhatsApp.

## Cronograma (pedido del dueño)
- **Viernes 24/10:** subir el paquete a la Chrome Web Store y enviarlo a revisión con **publicación diferida**: queda aprobada pero no sale al público hasta que se toque "Publicar". Google puede tardar de 1 a 3 días en revisar, por eso se manda antes.
- **Sábado 25/10:** pruebas de Germán con la extensión cargada a mano (ver "Probar antes de que salga").
- **Domingo 26/10:** últimas pruebas. A la noche, "Publicar" en la consola de la tienda.
- **Lunes 27/10, 12:00:** reel de lanzamiento.

## Lo que hace Germán (una sola vez)
1. Entrar a https://chrome.google.com/webstore/devconsole con cybermobile.ai@gmail.com y pagar la inscripción de desarrollador (US$5, un solo pago).
2. "Nuevo elemento" → subir el .zip.
3. Copiar los textos de abajo en cada campo y subir las imágenes de `extension/tienda/`.
4. En "Distribución", elegir **Público** y, al enviar, marcar **"Publicar manualmente después de la aprobación"** (publicación diferida).
5. Pasarle a Claude el **ID** que muestra la consola (32 letras). Con ese ID se deja la API cerrada solo para nuestra extensión.

## Probar antes de que salga
1. Descomprimir el .zip en una carpeta.
2. En Chrome: `chrome://extensions` → activar "Modo de desarrollador" (arriba a la derecha) → "Cargar descomprimida" → elegir la carpeta.
3. Fijar a Vera en la barra: ícono del rompecabezas → chincheta al lado de "Vera Antiestafas".
4. Probar:
   - el ícono con "Verificar esta página";
   - el clic derecho sobre un link y sobre un texto marcado;
   - "Analizar la pantalla";
   - subir un archivo;
   - después de 3 consultas, que aparezca el pago;
   - "Ya soy cliente" con el WhatsApp del staff.

## Textos de la ficha

**Nombre:** Vera Antiestafas · Cyber Mobile

**Resumen (máx. 132 caracteres):**
¿Es estafa? Verificá links, páginas, CBU, teléfonos, mails y capturas con Vera, la especialista en estafas. 3 consultas gratis.

**Categoría:** Herramientas (Tools) · **Idioma:** Español (Latinoamérica)

**Descripción:**
¿Te llegó un link raro? ¿Una página te pide tus datos? ¿No sabés si transferir a ese CBU? Preguntale a Vera antes de hacer clic, cargar datos o pagar.

Vera es la especialista en estafas de Cyber Mobile. Analiza lo que le mandás con herramientas de ciberseguridad (reputación de sitios, decenas de motores antivirus y casos reportados en Argentina) y te responde en segundos con un semáforo 🔴🟡🟢 y qué hacer.

Qué podés verificar:
• Links: clic derecho → "Verificar este link con Vera", sin abrirlo.
• La página donde estás: un banco, una tienda o un trámite que parece real.
• Lo que marcás con el mouse: un CBU o alias, un teléfono, un mail o un mensaje entero.
• Lo que ves en pantalla: Vera mira una captura y te dice si es una trampa.
• Archivos: capturas, PDF o APK de hasta 3 MB.

3 consultas gratis, sin registrarte. Después, seguí protegido con un plan mensual desde $10.000 por débito automático en Mercado Pago, que también incluye a Vera en tu WhatsApp. Si ya sos cliente, vinculás tu WhatsApp con un código y listo.

Privacidad: la extensión no lee tu historial ni las páginas que visitás. Solo envía lo que vos elegís verificar.

Cyber Mobile · Argentina · www.cybermobile.com.ar

**Sitio web:** https://www.cybermobile.com.ar
**Correo de soporte:** info@cybermobile.com.ar
**Política de privacidad:** https://www.cybermobile.com.ar/privacidad.html

## Prácticas de privacidad (formulario de la consola)

**Propósito único:** analizar links, páginas, textos, archivos y capturas que la persona elige para decirle si son una estafa.

**Justificación de permisos:**
- `activeTab`: leer la dirección de la pestaña y sacar una captura **solo cuando la persona toca** "Verificar esta página" o "Analizar la pantalla".
- `contextMenus`: agregar las opciones "Verificar con Vera" al clic derecho.
- `storage`: guardar el identificador de la sesión (para contar las 3 consultas gratis) y el pedido pendiente entre el clic derecho y la ventana de resultado.
- Permiso de host `https://www.cybermobile.com.ar/*`: enviar la consulta a la API de Vera.
- Código remoto: **No**, todo el código viene en el paquete.

**Datos que se recopilan** (marcar en el formulario):
- "Contenido del sitio web": la dirección de la página o la captura, solo cuando la persona lo pide.
- "Información de identificación personal": el número de WhatsApp, solo si la persona vincula su cuenta.

Certificar:
- que no se venden datos;
- que no se usan para fines ajenos al propósito único;
- que no se usan para evaluar créditos.

## Imágenes
- Ícono: 128×128, ya va dentro del paquete (`icons/icon-128.png`).
- Capturas 1280×800: `tienda/captura-1.png` (Vera abierta sobre una página falsa) y `tienda/captura-2.png` (resultado en rojo).
