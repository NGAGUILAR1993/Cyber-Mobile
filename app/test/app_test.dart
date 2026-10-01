import 'dart:convert';

import 'package:cyber_mobile/main.dart';
import 'package:cyber_mobile/servicios/api.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  testWidgets('verificar muestra el resultado del servidor', (tester) async {
    late Map<String, dynamic> enviado;
    final cliente = MockClient((req) async {
      if (req.url.path.endsWith('datos.json')) return http.Response(jsonEncode({'meta': {'mes': 'octubre de 2026'}, 'top10': []}), 200);
      enviado = jsonDecode(req.body) as Map<String, dynamic>;
      return http.Response.bytes(
          utf8.encode(jsonEncode({
            'id': 'x1',
            'veredicto': 'peligro',
            'titulo': 'Link falso de PAMI',
            'explicacion': 'Imita el sitio oficial.',
            'recomendaciones': ['No ingreses datos'],
          })),
          200,
          headers: {'content-type': 'application/json'});
    });
    await tester.pumpWidget(CyberMobileApp(api: Api(cliente: cliente)));
    await tester.enterText(find.byType(TextField), 'pami-tramites.com');
    await tester.ensureVisible(find.byIcon(Icons.search));
    await tester.tap(find.byIcon(Icons.search));
    await tester.pumpAndSettle();
    expect(enviado, {'tipo': 'link', 'valor': 'https://pami-tramites.com'});
    expect(find.text('Link falso de PAMI'), findsOneWidget);
    expect(find.text('RIESGO ALTO'), findsOneWidget);
  });

  testWidgets('si la verificación no está disponible ofrece WhatsApp', (tester) async {
    final cliente = MockClient((req) async => http.Response(
        jsonEncode({'error': 'La verificación dentro de la app todavía no está disponible.', 'codigo': 'no_configurado'}), 503));
    await tester.pumpWidget(CyberMobileApp(api: Api(cliente: cliente)));
    await tester.enterText(find.byType(TextField), 'pami-tramites.com');
    await tester.ensureVisible(find.byIcon(Icons.search));
    await tester.tap(find.byIcon(Icons.search));
    await tester.pumpAndSettle();
    expect(find.text('Verificación no disponible'), findsOneWidget);
    expect(find.text('Consultar por WhatsApp'), findsOneWidget);
  });

  testWidgets('errores de validación se muestran sin llamar al servidor', (tester) async {
    var llamadas = 0;
    final cliente = MockClient((req) async {
      if (!req.url.path.endsWith('datos.json')) llamadas++;
      return http.Response('{}', 200);
    });
    await tester.pumpWidget(CyberMobileApp(api: Api(cliente: cliente)));
    await tester.tap(find.text('Email'));
    await tester.pump();
    await tester.enterText(find.byType(TextField), 'no-es-mail');
    await tester.ensureVisible(find.byIcon(Icons.search));
    await tester.tap(find.byIcon(Icons.search));
    await tester.pump();
    expect(find.text('Ingresá un correo válido.'), findsOneWidget);
    expect(llamadas, 0);
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
