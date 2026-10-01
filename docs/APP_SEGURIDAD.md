# App Cyber Mobile: seguridad y privacidad

Estado de los 20 puntos de `APP_ROADMAP.md` para la versión 0.1 (Android).

## Implementado

| # | Punto | Cómo |
| --- | --- | --- |
| 1 | API keys y secretos | La app no contiene claves. La URL de n8n y el secreto están solo en variables de entorno de Vercel. La firma del APK se toma de secretos de GitHub, nunca del repo. |
| 4 | Acceso a datos | La app no tiene cuentas ni guarda historial: no hay datos de otras personas a los que acceder. |
| 5 | Inyección / XSS | Validación estricta en el servidor (`api/_lib/validar.js`) y en la app; la app muestra texto plano, nunca HTML. |
| 6 | Límites de API | 6 consultas por minuto y 40 por hora por IP (`api/app/verificar.js`). |
| 8 | Endpoints protegidos | Solo `POST`, tamaño máximo de 6 KB, respuestas sin caché, firma HMAC con marca de tiempo hacia n8n. |
| 9 | Sistema anti-error | Tiempo máximo de 25 s, errores genéricos sin detalles internos, alternativa por WhatsApp. |
| 10 | Info sensible | No se registra en logs lo que la persona verifica. Sin copias de seguridad de Android (`allowBackup=false`, reglas de extracción vacías). |
| 14 | Responsive | Interfaz de una columna con desplazamiento; probada en pruebas de widgets. |
| 17 | Accesibilidad | Botones de 52 px de alto, textos con contraste alto, componentes nativos de Material. |
| 20 | Legal | Pantalla de privacidad en la app y política pública en `/privacidad.html`. |

Además:

- **Permisos:** solo `INTERNET`. No lee SMS, llamadas, contactos, fotos ni usa accesibilidad.
  Lo sospechoso llega por "Compartir → Cyber Mobile" (elección explícita de la persona).
- **Red:** solo HTTPS (`usesCleartextTraffic=false`) y solo certificados del sistema.
- **Publicación:** APK con R8 (código minificado y recursos reducidos).

## Pendiente antes de publicar en Play

- [ ] Conectar n8n siguiendo `docs/N8N_CONTRATO.md`.
- [ ] **Play Integrity API** en `/api/app/verificar`, para aceptar solo pedidos de la app original.
- [ ] Crear la cuenta de Google Play Console y la clave de firma (ver `app/README.md`).
- [ ] Revisar la política de privacidad con un abogado (Ley 25.326) y completar en Play el formulario
      "Seguridad de los datos": la app **envía** datos que la persona ingresa (links, CBU, teléfono,
      email, mensajes) para su análisis, cifrados en tránsito, sin compartir con terceros para publicidad.
- [ ] Monitoreo de errores (punto 19) y analíticas con consentimiento (punto 18): elegir herramienta.
- [ ] Revisión de dependencias automatizada (punto 7): activar Dependabot para `app/pubspec.yaml`.
- [ ] Pruebas en celulares reales (puntos 11, 15, 16).

No corresponde por ahora: login (3, 11), base de datos con RLS (2), pagos (12), backups (13).
