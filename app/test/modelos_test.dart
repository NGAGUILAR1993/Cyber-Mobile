import 'package:cyber_mobile/modelos.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Resultado tolera datos incompletos o inesperados', () {
    final r = Resultado.desdeJson({'veredicto': 'raro', 'recomendaciones': ['a', 3, 'b']});
    expect(r.veredicto, Veredicto.desconocido);
    expect(r.recomendaciones, ['a', 'b']);
  });

  test('Observatorio lee datos.json y arma el slug de la ficha', () {
    final o = Observatorio.desdeJson({
      'meta': {'mes': 'octubre de 2026', 'actualizado': '2026-10-01T00:00:00Z'},
      'top10': [
        {'pos': 1, 'key': 'phishing_pami', 'nombre': 'Phishing de PAMI', 'canal': 'WHATSAPP', 'act': 82, 'riesgo': 'alto',
         'provincias': [{'nombre': 'Salta'}, 'Catamarca']}
      ],
      'watch': [{'pos': 11, 'key': 'sim_swapping@intl', 'nombre': 'SIM swapping', 'canal': 'TELEFONO', 'act': 30}],
    });
    expect(o.mes, 'octubre de 2026');
    expect(o.ranking.single.slug, 'phishing-pami');
    expect(o.ranking.single.canalTexto, 'WhatsApp');
    expect(o.ranking.single.provincias, ['Salta', 'Catamarca']);
    expect(o.vigilancia.single.slug, 'sim-swapping');
    expect(o.vigilancia.single.enVigilancia, isTrue);
  });
}
