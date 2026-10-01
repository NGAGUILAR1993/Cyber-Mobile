import 'package:cyber_mobile/validacion.dart';
import 'package:flutter_test/flutter_test.dart';

String _digito(String bloque, List<int> pesos) {
  var s = 0;
  for (var i = 0; i < bloque.length; i++) {
    s += int.parse(bloque[i]) * pesos[i % pesos.length];
  }
  return '${(10 - s % 10) % 10}';
}

void main() {
  const b1 = '0170099', b2 = '4000000123456';
  final cbu = b1 + _digito(b1, const [7, 1, 3, 9, 7, 1, 3]) + b2 + _digito(b2, const [3, 9, 7, 1]);

  group('validar', () {
    test('links: agrega https y rechaza esquemas peligrosos', () {
      expect(validar(TipoVerificacion.link, 'pami-tramites.com/login').valor, 'https://pami-tramites.com/login');
      expect(validar(TipoVerificacion.link, 'javascript:alert(1)').ok, isFalse);
      expect(validar(TipoVerificacion.link, 'hola').ok, isFalse);
    });
    test('CBU: dígitos verificadores y alias', () {
      expect(validar(TipoVerificacion.cbu, cbu).ok, isTrue);
      expect(validar(TipoVerificacion.cbu, '${cbu.substring(0, 21)}${(int.parse(cbu[21]) + 1) % 10}').ok, isFalse);
      expect(validar(TipoVerificacion.cbu, '123').ok, isFalse);
      expect(validar(TipoVerificacion.cbu, 'Mi.Alias.Pago').valor, 'mi.alias.pago');
    });
    test('teléfono y email', () {
      expect(validar(TipoVerificacion.telefono, '+54 9 11 5000-1234').valor, '+5491150001234');
      expect(validar(TipoVerificacion.telefono, '123').ok, isFalse);
      expect(validar(TipoVerificacion.email, 'A@B.COM').valor, 'a@b.com');
      expect(validar(TipoVerificacion.email, 'x@').ok, isFalse);
    });
    test('mensaje: largo mínimo y máximo', () {
      expect(validar(TipoVerificacion.mensaje, 'corto').ok, isFalse);
      expect(validar(TipoVerificacion.mensaje, 'a' * 4001).ok, isFalse);
      expect(validar(TipoVerificacion.mensaje, 'Hola abuela, cambié de número').ok, isTrue);
    });
    test('vacío', () => expect(validar(TipoVerificacion.link, '   ').ok, isFalse));
  });

  group('detectarTipo', () {
    test('reconoce lo compartido', () {
      expect(detectarTipo(cbu), TipoVerificacion.cbu);
      expect(detectarTipo('alguien@correo.com'), TipoVerificacion.email);
      expect(detectarTipo('+54 9 11 5000-1234'), TipoVerificacion.telefono);
      expect(detectarTipo('https://bit.ly/abc'), TipoVerificacion.link);
      expect(detectarTipo('PAMI informa: actualice sus datos en pami-x.com'), TipoVerificacion.mensaje);
    });
  });
}
