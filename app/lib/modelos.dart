/// Resultado de una verificación (contrato de api/app/verificar.js).
enum Veredicto { seguro, precaucion, peligro, desconocido }

Veredicto veredictoDe(Object? v) => switch (v) {
      'seguro' => Veredicto.seguro,
      'precaucion' => Veredicto.precaucion,
      'peligro' => Veredicto.peligro,
      _ => Veredicto.desconocido,
    };

class Resultado {
  final String id;
  final Veredicto veredicto;
  final String titulo;
  final String explicacion;
  final List<String> recomendaciones;

  const Resultado({
    required this.id,
    required this.veredicto,
    required this.titulo,
    required this.explicacion,
    required this.recomendaciones,
  });

  factory Resultado.desdeJson(Map<String, dynamic> j) => Resultado(
        id: (j['id'] ?? '').toString(),
        veredicto: veredictoDe(j['veredicto']),
        titulo: (j['titulo'] ?? '').toString(),
        explicacion: (j['explicacion'] ?? '').toString(),
        recomendaciones: (j['recomendaciones'] is List)
            ? (j['recomendaciones'] as List).whereType<String>().take(6).toList()
            : const [],
      );
}

/// Una modalidad de estafa del Observatorio (observatorio/datos.json).
class Modalidad {
  final int pos;
  final String clave;
  final String nombre;
  final String canal;
  final int indice;
  final int variacion;
  final String riesgo;
  final String como;
  final String detectar;
  final List<String> provincias;
  final bool enVigilancia;

  const Modalidad({
    required this.pos,
    required this.clave,
    required this.nombre,
    required this.canal,
    required this.indice,
    required this.variacion,
    required this.riesgo,
    required this.como,
    required this.detectar,
    required this.provincias,
    required this.enVigilancia,
  });

  /// Misma regla que la web para la URL de la ficha (`/observatorio/<slug>`).
  String get slug => clave.split('@').first.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-+|-+$'), '');

  String get canalTexto => const {
        'WHATSAPP': 'WhatsApp',
        'REDES': 'Redes',
        'TELEFONO': 'Teléfono',
        'TELÉFONO': 'Teléfono',
        'SMS': 'SMS',
        'MAIL': 'Email',
        'MARKETPLACE': 'Marketplace',
        'APP': 'App',
      }[canal.toUpperCase()] ??
      canal;

  factory Modalidad.desdeJson(Map<String, dynamic> j, {bool enVigilancia = false}) {
    int entero(Object? v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
    return Modalidad(
      pos: entero(j['pos']),
      clave: (j['key'] ?? '').toString(),
      nombre: (j['nombre'] ?? '').toString(),
      canal: (j['canal'] ?? '').toString(),
      indice: entero(j['act']).clamp(0, 100),
      variacion: entero(j['delta']),
      riesgo: (j['riesgo'] ?? 'medio').toString(),
      como: (j['como'] ?? '').toString(),
      detectar: (j['detectar'] ?? '').toString(),
      provincias: (j['provincias'] is List)
          ? (j['provincias'] as List)
              .map((p) => p is Map ? (p['nombre'] ?? '').toString() : p.toString())
              .where((s) => s.isNotEmpty)
              .toList()
          : const [],
      enVigilancia: enVigilancia,
    );
  }
}

class Observatorio {
  final String mes;
  final DateTime? actualizado;
  final List<Modalidad> ranking;
  final List<Modalidad> vigilancia;

  const Observatorio({required this.mes, required this.actualizado, required this.ranking, required this.vigilancia});

  factory Observatorio.desdeJson(Map<String, dynamic> j) {
    final meta = (j['meta'] is Map) ? j['meta'] as Map : const {};
    List<Modalidad> lista(Object? l, {bool vig = false}) => (l is List)
        ? l.whereType<Map<String, dynamic>>().map((m) => Modalidad.desdeJson(m, enVigilancia: vig)).toList()
        : const [];
    return Observatorio(
      mes: (meta['mes'] ?? '').toString(),
      actualizado: DateTime.tryParse((meta['actualizado'] ?? '').toString()),
      ranking: lista(j['top10']),
      vigilancia: lista(j['watch'], vig: true),
    );
  }
}
