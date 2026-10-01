/// Validación local, igual a la del servidor (api/_lib/validar.js).
/// Sirve para avisar errores al instante; el servidor vuelve a validar todo.
enum TipoVerificacion { link, cbu, telefono, email, mensaje }

extension TipoTexto on TipoVerificacion {
  String get id => name;
  String get etiqueta => const {
        TipoVerificacion.link: 'Link',
        TipoVerificacion.cbu: 'CBU / CVU',
        TipoVerificacion.telefono: 'Teléfono',
        TipoVerificacion.email: 'Email',
        TipoVerificacion.mensaje: 'Mensaje',
      }[this]!;
  String get ayuda => const {
        TipoVerificacion.link: 'Pegá el link que te llegó por SMS, WhatsApp o redes. No lo abras antes.',
        TipoVerificacion.cbu: 'CBU o CVU de 22 números, o el alias de la cuenta, antes de transferir.',
        TipoVerificacion.telefono: 'El número que te llamó o te escribió.',
        TipoVerificacion.email: 'Revisamos si tu correo apareció en filtraciones de datos.',
        TipoVerificacion.mensaje: 'Pegá el texto completo del mensaje sospechoso.',
      }[this]!;
  String get ejemplo => const {
        TipoVerificacion.link: 'ej. pami-tramites-online.com',
        TipoVerificacion.cbu: 'ej. 0170099240000001234563 o alias.pago',
        TipoVerificacion.telefono: 'ej. +54 9 11 5000-1234',
        TipoVerificacion.email: 'ej. tunombre@gmail.com',
        TipoVerificacion.mensaje: 'Pegá acá el mensaje…',
      }[this]!;
}

class Validado {
  final String? valor;
  final String? error;
  const Validado.ok(this.valor) : error = null;
  const Validado.error(this.error) : valor = null;
  bool get ok => error == null;
}

bool _digitoOk(String bloque, List<int> pesos) {
  final cuerpo = bloque.substring(0, bloque.length - 1);
  var suma = 0;
  for (var i = 0; i < cuerpo.length; i++) {
    suma += int.parse(cuerpo[i]) * pesos[i % pesos.length];
  }
  return (10 - (suma % 10)) % 10 == int.parse(bloque[bloque.length - 1]);
}

bool cbuValido(String n) {
  if (!RegExp(r'^\d{22}$').hasMatch(n)) return false;
  return _digitoOk(n.substring(0, 8), const [7, 1, 3, 9, 7, 1, 3]) &&
      _digitoOk(n.substring(8), const [3, 9, 7, 1]);
}

Validado validar(TipoVerificacion tipo, String crudo) {
  final v = crudo.replaceAll(RegExp(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]'), '').trim();
  if (v.isEmpty) return const Validado.error('Falta el dato a verificar.');
  switch (tipo) {
    case TipoVerificacion.link:
      if (v.length > 2048) return const Validado.error('El link es demasiado largo.');
      final conEsquema = RegExp(r'^[a-z][a-z0-9+.-]*://', caseSensitive: false).hasMatch(v) ? v : 'https://$v';
      final u = Uri.tryParse(conEsquema);
      if (u == null || !(u.scheme == 'http' || u.scheme == 'https') || !u.host.contains('.') || u.host.length > 253) {
        return const Validado.error('No parece un link válido.');
      }
      return Validado.ok(u.toString());
    case TipoVerificacion.cbu:
      final d = v.replaceAll(RegExp(r'[\s-]'), '');
      if (RegExp(r'^\d+$').hasMatch(d)) {
        if (d.length != 22) return const Validado.error('El CBU o CVU tiene que tener 22 números.');
        if (!cbuValido(d)) return const Validado.error('Ese CBU o CVU no es válido: revisá los números.');
        return Validado.ok(d);
      }
      final alias = v.toLowerCase();
      if (!RegExp(r'^[a-z0-9.-]{6,20}$').hasMatch(alias)) {
        return const Validado.error('Ingresá un CBU/CVU de 22 números o un alias (6 a 20 letras, números, puntos o guiones).');
      }
      return Validado.ok(alias);
    case TipoVerificacion.telefono:
      final t = v.replaceAll(RegExp(r'[\s().-]'), '');
      if (!RegExp(r'^\+?\d{8,15}$').hasMatch(t)) {
        return const Validado.error('Ingresá un número de teléfono válido (8 a 15 dígitos).');
      }
      return Validado.ok(t);
    case TipoVerificacion.email:
      final e = v.toLowerCase();
      if (e.length > 254 || !RegExp(r'''^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[a-z]{2,}$''').hasMatch(e)) {
        return const Validado.error('Ingresá un correo válido.');
      }
      return Validado.ok(e);
    case TipoVerificacion.mensaje:
      if (v.length < 10) return const Validado.error('Pegá el mensaje completo para poder analizarlo.');
      if (v.length > 4000) return const Validado.error('El mensaje es demasiado largo (máximo 4000 caracteres).');
      return Validado.ok(v);
  }
}

/// Adivina qué tipo de dato es un texto compartido desde otra app.
TipoVerificacion detectarTipo(String texto) {
  final t = texto.trim();
  final sinEspacios = t.replaceAll(RegExp(r'[\s-]'), '');
  if (RegExp(r'^\d{22}$').hasMatch(sinEspacios)) return TipoVerificacion.cbu;
  if (RegExp(r'^[^\s@]+@[^\s@]+\.[a-z]{2,}$', caseSensitive: false).hasMatch(t)) return TipoVerificacion.email;
  if (RegExp(r'^\+?[\d\s().-]{8,20}$').hasMatch(t)) return TipoVerificacion.telefono;
  final esSoloLink = !t.contains(' ') &&
      RegExp(r'^(https?://)?[\w-]+(\.[\w-]+)+(/\S*)?$', caseSensitive: false).hasMatch(t);
  if (esSoloLink) return TipoVerificacion.link;
  return TipoVerificacion.mensaje;
}
