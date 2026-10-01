import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config.dart';

/// Texto que llega con "Compartir → Cyber Mobile" desde otra app.
class Compartir {
  static const _canal = MethodChannel('ar.com.cybermobile/compartir');

  static Future<String?> textoInicial() async {
    try {
      return await _canal.invokeMethod<String>('textoInicial');
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }

  static void escuchar(void Function(String texto) alRecibir) {
    _canal.setMethodCallHandler((call) async {
      if (call.method == 'textoCompartido' && call.arguments is String) alRecibir(call.arguments as String);
    });
  }
}

/// Abre links externos (web, WhatsApp) fuera de la app.
Future<bool> abrir(String url) => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);

Future<bool> abrirWhatsApp(String texto) =>
    abrir('https://wa.me/${Config.whatsapp}?text=${Uri.encodeComponent(texto)}');

Future<bool> compartirPorWhatsApp(String texto) => abrir('https://wa.me/?text=${Uri.encodeComponent(texto)}');
