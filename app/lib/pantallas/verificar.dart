import 'package:flutter/material.dart';

import '../servicios/api.dart';
import '../servicios/compartir.dart';
import '../tema.dart';
import '../validacion.dart';
import 'resultado.dart';

class Verificar extends StatefulWidget {
  const Verificar({super.key, required this.api});
  final Api api;

  @override
  State<Verificar> createState() => VerificarState();
}

class VerificarState extends State<Verificar> {
  TipoVerificacion _tipo = TipoVerificacion.link;
  final _texto = TextEditingController();
  String? _error;
  bool _cargando = false;

  /// Llamado cuando llega texto con "Compartir → Cyber Mobile".
  void cargarCompartido(String texto) {
    setState(() {
      _tipo = detectarTipo(texto);
      _texto.text = texto;
      _error = null;
    });
  }

  @override
  void dispose() {
    _texto.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    FocusScope.of(context).unfocus();
    final v = validar(_tipo, _texto.text);
    if (!v.ok) {
      setState(() => _error = v.error);
      return;
    }
    setState(() {
      _error = null;
      _cargando = true;
    });
    try {
      final r = await widget.api.verificar(_tipo, v.valor!);
      if (!mounted) return;
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => ResultadoPantalla(resultado: r, tipo: _tipo)));
      if (mounted) _texto.clear();
    } on ErrorVerificacion catch (e) {
      if (!mounted) return;
      _mostrarError(e);
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  void _mostrarError(ErrorVerificacion e) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Marca.superficie,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(e.noDisponible ? 'Verificación no disponible' : 'No pudimos verificarlo',
                  style: Theme.of(ctx).textTheme.titleLarge),
              const SizedBox(height: 10),
              Text(e.mensaje, style: Theme.of(ctx).textTheme.bodyLarge),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  abrirWhatsApp('Hola, quiero verificar esto: ${_texto.text.trim()}');
                },
                icon: const Icon(Icons.chat_outlined),
                label: const Text('Consultar por WhatsApp'),
              ),
              const SizedBox(height: 10),
              OutlinedButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cerrar')),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Row(children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset('assets/logo-cm.png', width: 34, height: 34),
          ),
          const SizedBox(width: 10),
          Text('CYBER MOBILE', style: t.titleMedium?.copyWith(letterSpacing: 2.4, fontSize: 15)),
        ]),
        const SizedBox(height: 28),
        Text('¿Te llegó algo sospechoso?', style: t.headlineMedium),
        const SizedBox(height: 8),
        Text('Verificalo antes de responder, hacer clic o transferir.', style: t.bodyLarge),
        const SizedBox(height: 24),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final tipo in TipoVerificacion.values)
              ChoiceChip(
                label: Text(tipo.etiqueta),
                selected: _tipo == tipo,
                showCheckmark: false,
                labelStyle: TextStyle(color: _tipo == tipo ? Marca.tintaAcento : Marca.texto2, fontWeight: FontWeight.w600),
                onSelected: (_) => setState(() {
                  _tipo = tipo;
                  _error = null;
                }),
              ),
          ],
        ),
        const SizedBox(height: 16),
        Text(_tipo.ayuda, style: t.bodyMedium),
        const SizedBox(height: 12),
        TextField(
          controller: _texto,
          enabled: !_cargando,
          minLines: _tipo == TipoVerificacion.mensaje ? 5 : 1,
          maxLines: _tipo == TipoVerificacion.mensaje ? 10 : 3,
          maxLength: _tipo == TipoVerificacion.mensaje ? 4000 : 2048,
          keyboardType: switch (_tipo) {
            TipoVerificacion.telefono => TextInputType.phone,
            TipoVerificacion.email => TextInputType.emailAddress,
            TipoVerificacion.link => TextInputType.url,
            _ => TextInputType.multiline,
          },
          autocorrect: false,
          enableSuggestions: false,
          style: const TextStyle(color: Marca.texto, fontSize: 16),
          decoration: InputDecoration(hintText: _tipo.ejemplo, errorText: _error, errorMaxLines: 3, counterText: ''),
          onChanged: (_) {
            if (_error != null) setState(() => _error = null);
          },
          onSubmitted: (_) => _enviar(),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: _cargando ? null : _enviar,
          icon: _cargando
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Marca.tintaAcento))
              : const Icon(Icons.search),
          label: Text(_cargando ? 'Analizando…' : 'Verificar'),
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0x1422D3EE),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0x4D22D3EE)),
          ),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.lock_outline, color: Marca.acento, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Lo que verificás viaja cifrado a Cyber Mobile y, si hace falta, a servicios de análisis '
                'de seguridad, solo para evaluarlo. La app no lo guarda en tu teléfono ni lee tus mensajes: '
                'vos elegís qué compartir.',
                style: t.bodyMedium?.copyWith(fontSize: 13.5),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 16),
        Text('Tip: en WhatsApp o SMS mantené apretado el mensaje, tocá Compartir y elegí Cyber Mobile.',
            style: t.bodySmall?.copyWith(color: Marca.apagado)),
      ],
    );
  }
}
