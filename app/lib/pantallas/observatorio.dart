import 'package:flutter/material.dart';

import '../modelos.dart';
import '../servicios/api.dart';
import '../tema.dart';
import 'ficha.dart';

class ObservatorioPantalla extends StatefulWidget {
  const ObservatorioPantalla({super.key, required this.api});
  final Api api;

  @override
  State<ObservatorioPantalla> createState() => _ObservatorioPantallaState();
}

class _ObservatorioPantallaState extends State<ObservatorioPantalla> with AutomaticKeepAliveClientMixin {
  late Future<Observatorio> _datos;
  String _canal = 'Todos';

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _datos = widget.api.observatorio();
  }

  Future<void> _recargar() async {
    final f = widget.api.observatorio();
    setState(() => _datos = f);
    await f.catchError((_) => const Observatorio(mes: '', actualizado: null, ranking: [], vigilancia: []));
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final t = Theme.of(context).textTheme;
    return FutureBuilder<Observatorio>(
      future: _datos,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snap.hasError || !snap.hasData) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.cloud_off_outlined, color: Marca.apagado, size: 40),
                const SizedBox(height: 12),
                Text('${snap.error ?? 'No pudimos cargar el Observatorio.'}', textAlign: TextAlign.center, style: t.bodyLarge),
                const SizedBox(height: 16),
                OutlinedButton(onPressed: _recargar, child: const Text('Reintentar')),
              ]),
            ),
          );
        }
        final o = snap.data!;
        final canales = ['Todos', ...{for (final m in o.ranking) m.canalTexto}];
        final lista = o.ranking.where((m) => _canal == 'Todos' || m.canalTexto == _canal).toList();
        return RefreshIndicator(
          onRefresh: _recargar,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: [
              Text('OBSERVATORIO DE FRAUDE DIGITAL', style: mono.copyWith(color: Marca.acento, fontSize: 11, letterSpacing: 2)),
              const SizedBox(height: 10),
              Text('Las estafas que más circulan', style: t.headlineMedium),
              const SizedBox(height: 6),
              Text('Ranking en curso · ${o.mes} · Argentina', style: t.bodyMedium),
              const SizedBox(height: 18),
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: canales.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => ChoiceChip(
                    label: Text(canales[i]),
                    selected: _canal == canales[i],
                    showCheckmark: false,
                    labelStyle: TextStyle(color: _canal == canales[i] ? Marca.tintaAcento : Marca.texto2),
                    onSelected: (_) => setState(() => _canal = canales[i]),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              for (final m in lista) ...[
                _TarjetaModalidad(m: m),
                const SizedBox(height: 10),
              ],
              if (o.vigilancia.isNotEmpty && _canal == 'Todos') ...[
                const SizedBox(height: 14),
                Text('En vigilancia', style: t.titleLarge),
                const SizedBox(height: 10),
                for (final m in o.vigilancia) ...[
                  _TarjetaModalidad(m: m, compacta: true),
                  const SizedBox(height: 8),
                ],
              ],
            ],
          ),
        );
      },
    );
  }
}

class _TarjetaModalidad extends StatelessWidget {
  const _TarjetaModalidad({required this.m, this.compacta = false});
  final Modalidad m;
  final bool compacta;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final color = m.riesgo == 'alto' ? Marca.alto : m.riesgo == 'medio' ? Marca.medio : Marca.info;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => FichaPantalla(m: m))),
        child: Padding(
          padding: EdgeInsets.all(compacta ? 14 : 18),
          child: Row(children: [
            SizedBox(
              width: 44,
              child: Text(m.pos.toString().padLeft(2, '0'), style: mono.copyWith(color: Marca.acento, fontSize: compacta ? 18 : 24)),
            ),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(m.nombre, style: t.titleMedium),
                const SizedBox(height: 6),
                Row(children: [
                  Text(m.canalTexto.toUpperCase(), style: mono.copyWith(color: Marca.texto2, fontSize: 10.5, letterSpacing: 1.2)),
                  if (!compacta) ...[
                    const SizedBox(width: 10),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(99),
                        child: LinearProgressIndicator(
                          value: m.indice / 100,
                          minHeight: 6,
                          backgroundColor: const Color(0x24949FB8),
                          color: color,
                        ),
                      ),
                    ),
                  ],
                ]),
              ]),
            ),
            const SizedBox(width: 12),
            Text('${m.indice}', style: mono.copyWith(color: Marca.texto, fontSize: compacta ? 15 : 20)),
            const Icon(Icons.chevron_right, color: Marca.apagado),
          ]),
        ),
      ),
    );
  }
}
