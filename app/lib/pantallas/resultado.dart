import 'package:flutter/material.dart';

import '../modelos.dart';
import '../servicios/compartir.dart';
import '../tema.dart';
import '../validacion.dart';

class ResultadoPantalla extends StatelessWidget {
  const ResultadoPantalla({super.key, required this.resultado, required this.tipo});
  final Resultado resultado;
  final TipoVerificacion tipo;

  static (Color, IconData, String) estilo(Veredicto v) => switch (v) {
        Veredicto.peligro => (Marca.alto, Icons.dangerous_outlined, 'RIESGO ALTO'),
        Veredicto.precaucion => (Marca.medio, Icons.warning_amber_rounded, 'PRECAUCIÓN'),
        Veredicto.seguro => (Marca.seguro, Icons.verified_outlined, 'SIN SEÑALES DE RIESGO'),
        Veredicto.desconocido => (Marca.info, Icons.help_outline, 'SIN DATOS SUFICIENTES'),
      };

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final (color, icono, etiqueta) = estilo(resultado.veredicto);
    return Scaffold(
      appBar: AppBar(title: Text('Resultado · ${tipo.etiqueta}')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: color.withValues(alpha: 0.5)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(icono, color: color, size: 28),
                  const SizedBox(width: 10),
                  Text(etiqueta, style: mono.copyWith(color: color, fontSize: 12, letterSpacing: 1.6, fontWeight: FontWeight.w600)),
                ]),
                const SizedBox(height: 14),
                Text(resultado.titulo, style: t.headlineSmall),
                if (resultado.explicacion.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(resultado.explicacion, style: t.bodyLarge),
                ],
              ]),
            ),
            if (resultado.recomendaciones.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Qué hacer', style: t.titleLarge),
              const SizedBox(height: 12),
              for (final (i, r) in resultado.recomendaciones.indexed)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Container(
                          width: 28,
                          height: 28,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0x1422D3EE),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0x4D22D3EE)),
                          ),
                          child: Text('${i + 1}', style: mono.copyWith(color: Marca.acento, fontSize: 13)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Text(r, style: t.bodyLarge)),
                      ]),
                    ),
                  ),
                ),
            ],
            const SizedBox(height: 20),
            Text(
              'Este análisis es orientativo y no reemplaza la consulta con tu banco o el organismo involucrado.',
              style: t.bodySmall?.copyWith(color: Marca.apagado),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: () => abrirWhatsApp('Hola, verifiqué algo en la app (consulta ${resultado.id}) y quiero hacer una pregunta.'),
              icon: const Icon(Icons.chat_outlined),
              label: const Text('Consultar con un especialista'),
            ),
            const SizedBox(height: 10),
            OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Verificar otra cosa')),
          ],
        ),
      ),
    );
  }
}
