import 'package:flutter/material.dart';

import '../config.dart';
import '../modelos.dart';
import '../servicios/compartir.dart';
import '../tema.dart';

class FichaPantalla extends StatelessWidget {
  const FichaPantalla({super.key, required this.m});
  final Modalidad m;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final color = m.riesgo == 'alto' ? Marca.alto : m.riesgo == 'medio' ? Marca.medio : Marca.info;
    final urlFicha = '${Config.sitio}/observatorio/${m.slug}';
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
          children: [
            Text(m.enVigilancia ? 'EN VIGILANCIA' : '#${m.pos} DEL RANKING',
                style: mono.copyWith(color: Marca.acento, fontSize: 11, letterSpacing: 2)),
            const SizedBox(height: 10),
            Text(m.nombre, style: t.headlineMedium),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
              Chip(label: Text(m.canalTexto.toUpperCase(), style: mono.copyWith(fontSize: 11, color: Marca.texto2))),
              Chip(
                label: Text('Riesgo ${m.riesgo}', style: TextStyle(color: color, fontWeight: FontWeight.w600)),
                backgroundColor: color.withValues(alpha: 0.12),
                side: BorderSide.none,
              ),
              Text('Índice ${m.indice}/100', style: mono.copyWith(color: Marca.texto2, fontSize: 13)),
            ]),
            if (m.detectar.isNotEmpty) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0x1422D3EE),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0x5922D3EE)),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('CÓMO RECONOCERLA', style: mono.copyWith(color: Marca.acento, fontSize: 11, letterSpacing: 1.6)),
                  const SizedBox(height: 8),
                  Text(m.detectar, style: t.bodyLarge?.copyWith(color: Marca.texto)),
                ]),
              ),
            ],
            if (m.como.isNotEmpty) ...[
              const SizedBox(height: 22),
              Text('Cómo opera', style: t.titleLarge),
              const SizedBox(height: 8),
              Text(m.como, style: t.bodyLarge),
            ],
            if (m.provincias.isNotEmpty) ...[
              const SizedBox(height: 22),
              Text('Dónde se reportó', style: t.titleMedium),
              const SizedBox(height: 8),
              Wrap(spacing: 8, runSpacing: 8, children: [for (final p in m.provincias) Chip(label: Text(p))]),
            ],
            const SizedBox(height: 28),
            FilledButton.icon(
              onPressed: () => compartirPorWhatsApp(
                  'Alerta de estafa: ${m.nombre}.\n\nCómo reconocerla: ${m.detectar}\n\nMás info: $urlFicha'),
              icon: const Icon(Icons.share_outlined),
              label: const Text('Avisar a mi familia'),
            ),
            const SizedBox(height: 10),
            if (m.slug.isNotEmpty)
              OutlinedButton.icon(
                onPressed: () => abrir(urlFicha),
                icon: const Icon(Icons.open_in_new, size: 18),
                label: const Text('Ver ficha completa en la web'),
              ),
          ],
        ),
      ),
    );
  }
}
