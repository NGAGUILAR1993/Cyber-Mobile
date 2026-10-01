/// Configuración pública de la app. No hay claves ni secretos acá: todo lo
/// sensible (n8n, servicios de análisis) vive en el servidor.
class Config {
  static const String sitio = 'https://www.cybermobile.com.ar';
  static const String apiVerificar = '$sitio/api/app/verificar';
  static const String datosObservatorio = '$sitio/observatorio/datos.json';
  static const String politicaPrivacidad = '$sitio/privacidad.html';
  static const String whatsapp = '5491170598505';
  static const String version = '0.1.0';
  static const Duration timeout = Duration(seconds: 30);
}
