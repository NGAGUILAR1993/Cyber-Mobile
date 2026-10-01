# App Cyber Mobile (Flutter) — requisitos a tener en cuenta

Notas de referencia para cuando se inicie el desarrollo de la app.

## Checklist antes de publicar (20 puntos)

**Seguridad**
1. API keys y secretos fuera del código (nunca en el binario de la app)
2. Permisos de base de datos y RLS (Row Level Security)
3. La autenticación funciona de punta a punta
4. Acceso a datos único: cada usuario ve solo lo suyo
5. Protección contra inyección SQL y XSS
6. Límites de uso (rate limiting) en la API
7. Revisión de dependencias (vulnerabilidades conocidas)
8. Endpoints de la API protegidos y validados
9. Sistema anti-error: manejo de fallos sin romper la app
10. Información sensible: sin datos personales en logs ni en el almacenamiento local sin cifrar

**Calidad y operación**
11. Pruebas de login
12. Comprobación de pagos (si aplica)
13. Backups
14. Diseño responsive (celulares y tablets de distintos tamaños)
15. Llamadas a la API eficientes
16. Tiempo de carga
17. Accesibilidad
18. Analytics
19. Monitoreo de errores (crash reporting)
20. Legal: términos, política de privacidad, cumplimiento de la Ley 25.326 de Protección de Datos Personales

## Crecimiento

- **ASO (App Store Optimization):** título, descripción, palabras clave, capturas y video pensados para posicionar en Play Store.
- **Firebase Analytics:** medir eventos clave (verificación realizada, resultado, consulta al agente).
- **Retención D1 / D7 / D30:** tablero para ver cuántos usuarios vuelven al día 1, 7 y 30.
- **Notificaciones push segmentadas por comportamiento:** por ejemplo, alertas del Observatorio según el canal donde el usuario suele recibir mensajes (WhatsApp, SMS, redes).

## Punto de partida funcional

Las 8 herramientas de la web: verificar email, CVU/CBU, URL, archivo, IP, organización, teléfono y asesoría general, más las alertas del Observatorio de Fraude Digital.
