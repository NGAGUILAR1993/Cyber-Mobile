import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../modelos.dart';
import '../validacion.dart';

/// Error con un mensaje listo para mostrar a la persona.
class ErrorVerificacion implements Exception {
  final String mensaje;
  final bool noDisponible;
  const ErrorVerificacion(this.mensaje, {this.noDisponible = false});
  @override
  String toString() => mensaje;
}

class Api {
  Api({http.Client? cliente}) : _cliente = cliente ?? http.Client();
  final http.Client _cliente;

  static const _cabeceras = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': Config.version,
  };

  /// Envía el dato al servidor de Cyber Mobile, que lo reenvía firmado a n8n.
  /// Nada de esto se guarda en el teléfono.
  Future<Resultado> verificar(TipoVerificacion tipo, String valor) async {
    final http.Response r;
    try {
      r = await _cliente
          .post(Uri.parse(Config.apiVerificar),
              headers: _cabeceras, body: jsonEncode({'tipo': tipo.id, 'valor': valor}))
          .timeout(Config.timeout);
    } on TimeoutException {
      throw const ErrorVerificacion('La verificación tardó demasiado. Probá de nuevo.');
    } on SocketException {
      throw const ErrorVerificacion('No hay conexión a internet. Revisá tu conexión y probá de nuevo.');
    } on http.ClientException {
      throw const ErrorVerificacion('No pudimos conectarnos con Cyber Mobile. Probá de nuevo.');
    }

    Map<String, dynamic> cuerpo = const {};
    try {
      final d = jsonDecode(utf8.decode(r.bodyBytes));
      if (d is Map<String, dynamic>) cuerpo = d;
    } catch (_) {}

    if (r.statusCode == 200) return Resultado.desdeJson(cuerpo);
    final msg = (cuerpo['error'] is String) ? cuerpo['error'] as String : 'No pudimos completar la verificación.';
    throw ErrorVerificacion(msg, noDisponible: r.statusCode == 503);
  }

  /// Datos públicos del Observatorio de Fraude Digital.
  Future<Observatorio> observatorio() async {
    try {
      final r = await _cliente.get(Uri.parse(Config.datosObservatorio)).timeout(Config.timeout);
      if (r.statusCode != 200) throw const ErrorVerificacion('No pudimos cargar el Observatorio.');
      final d = jsonDecode(utf8.decode(r.bodyBytes));
      if (d is! Map<String, dynamic>) throw const ErrorVerificacion('No pudimos cargar el Observatorio.');
      return Observatorio.desdeJson(d);
    } on ErrorVerificacion {
      rethrow;
    } catch (_) {
      throw const ErrorVerificacion('No pudimos cargar el Observatorio. Revisá tu conexión.');
    }
  }
}
