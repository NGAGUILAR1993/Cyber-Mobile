# App Cyber Mobile (Flutter · Android)

Verificá links, CBU/CVU, teléfonos, correos y mensajes sospechosos, y consultá el
Observatorio de Fraude Digital.

## Probar la app en tu celular

1. En GitHub, pestaña **Actions** → workflow **App Android** → la última ejecución en verde.
2. Abajo, en **Artifacts**, descargá `cyber-mobile-apk` y descomprimilo.
3. Pasá `app-release.apk` al celular Android y abrilo (pedirá permitir "instalar apps de origen desconocido").

Ese APK está firmado con una clave de prueba: sirve para probar, no para publicar en Play.

## Desarrollo

```bash
cd app
flutter pub get
flutter analyze
flutter test
flutter run            # con un celular o emulador conectado
```

## Arquitectura

- `lib/servicios/api.dart`: habla solo con `https://www.cybermobile.com.ar`
  (`/api/app/verificar` y `/observatorio/datos.json`).
- `lib/validacion.dart`: misma validación que el servidor (`api/_lib/validar.js`).
- `android/.../MainActivity.kt`: recibe el texto de "Compartir → Cyber Mobile".
- Seguridad y pendientes: `docs/APP_SEGURIDAD.md`. Conexión con n8n: `docs/N8N_CONTRATO.md`.

## Firma para Google Play

1. Crear la clave una sola vez y guardarla en un lugar seguro (si se pierde, no se puede actualizar la app):
   `keytool -genkey -v -keystore cyber-mobile.jks -keyalg RSA -keysize 4096 -validity 10000 -alias cybermobile`
2. En GitHub → Settings → Secrets and variables → Actions, crear:
   `CM_KEYSTORE_BASE64` (el archivo en base64), `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD`.
3. El workflow **App Android** va a firmar el APK con esa clave.
