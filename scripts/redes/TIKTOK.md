# TikTok de Cyber Mobile

Guía para la cuenta de TikTok. Las reglas de `CLAUDE.md` siguen valiendo, salvo la duración: en TikTok los videos duran **26 segundos** para que se lleguen a leer los mensajes. También valen portada que abre una incógnita, datos personales tapados y marcas de otras IA solo en el texto.

## Cuenta
- **Tipo:** cuenta de empresa (Configuración → Cuenta → Cambiar a cuenta de empresa), categoría "Ciencia y tecnología". Da estadísticas y permite el link en el perfil.
- **Usuario:** `@cybermobile.ar` (si está tomado: `@vera.antiestafas`).
- **Nombre** (TikTok lo usa en la búsqueda): `Vera · Antiestafas`.
- **Foto:** el escudo de Cyber Mobile (`logo-cm.png`).
- **Bio** (máximo 80 caracteres):
  ```
  ¿Mensaje raro? Mandáselo a Vera 🔴🟡🟢
  IA antiestafas en WhatsApp · 7 días gratis
  ```
- **Link:** `https://www.cybermobile.com.ar/vera?o=tiktok`. Los clics se cuentan aparte en Redis (`cm:vera:clics:<fecha>`, campo `tiktok`).
- **CTA en TikTok:** "Link en el perfil · 7 días gratis". En TikTok no hay ManyChat, así que "Comentá VERA" no manda el link solo. Los comentarios se piden con una pregunta ("¿cuántas acertaste?") porque son lo que más empuja el alcance.

## Público
1. **Hijos y nietos de 25 a 45 años que cuidan a sus padres.** Es el público más grande de TikTok en Argentina y el que compra el Pack Padres o el Familiar. El mensaje: "mandale esto a tu vieja".
2. **Gente que compra y vende online** (Mercado Libre, Marketplace, Instagram), de 20 a 40 años: comprobantes truchos, falsos soportes de Mercado Pago, alquileres y envíos.
3. **Emprendedores y PyMEs:** el plan Empresas. Se los alcanza con casos de comprobantes falsos y suplantación de proveedores.

## Estilo
- **Lo que nos diferencia:** no hacemos videos de "cuidado con esta estafa", que hay miles. Cada video es un **juego o una prueba** que el público responde en los comentarios, y Vera aparece como la herramienta que lo resuelve en segundos.
- **Estética (desde el 16/10):** el estilo claro del plan nuevo: fondo crema, chats de WhatsApp en modo claro (con los datos tapados) y notas blancas con letra grande. El primer segundo tiene que tener texto en pantalla.
- **Zona segura:** nada importante en los 200 px de arriba, los 170 px de la derecha ni los 440 px de abajo (ahí van los botones y el texto de TikTok).
- **Sonido:** un tema en tendencia de la biblioteca comercial de TikTok (las cuentas de empresa solo pueden usar esa). Se elige al publicar.

## Series
| Serie | Idea | Para quién |
|---|---|---|
| **¿Estafa o real?** | 3 mensajes, uno es real; las respuestas al final. Se pide "comentá cuántas acertaste". | Todos |
| **Se lo mandé a Vera** | Captura real de una consulta a Vera, con datos tapados. | Todos |
| **Mandale esto a tu vieja** | La estafa del momento explicada para que la reenvíen a la familia. | Hijos y nietos |
| **Anatomía de una estafa** | Se desarma una estafa en 3 señales (por ejemplo, el homógrafo de Amazon). | Compras online |
| **Dúo o Stitch** | Se responde a un video viral de estafa mostrando cómo la detecta Vera. | Alcance |

## Frecuencia
Lunes, miércoles y viernes a las 20:00. Se pueden reusar los reels de Instagram cambiando el cierre por "Link en el perfil".

## Automático
- **Generador:** `node scripts/tiktok/generar.mjs` arma el próximo episodio de `scripts/tiktok/episodios.json` en `redes/<fecha>/tiktok-<id>/` (video de 26 s, portada, textos) y lo marca como publicado.
- **Tarea programada "TikTok automático"** (lunes, miércoles y viernes 18:10 AR): genera el video, lo publica en la web, lo sube a TikTok con el conector de Higgsfield y deja el formulario listo. Germán recibe un aviso y un mail, abre la sesión y confirma. TikTok exige que el dueño de la cuenta apruebe cada publicación.
- **Episodios nuevos:** cuando quedan 2 o menos sin usar, la tarea escribe 3 más con casos reales de Argentina (mensajes recreados, números tapados, una sola respuesta real).

## Publicaciones
- **15/10:** `redes/2026-10-15/tiktok-correo-mp-whatsapp/`, "¿Estafa o real?" (Correo Argentino falso, falso soporte de Mercado Pago, código real de WhatsApp).
