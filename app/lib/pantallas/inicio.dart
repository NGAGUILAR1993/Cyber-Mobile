import 'package:flutter/material.dart';

import '../servicios/api.dart';
import '../servicios/compartir.dart';
import 'acerca.dart';
import 'observatorio.dart';
import 'verificar.dart';

class Inicio extends StatefulWidget {
  const Inicio({super.key, required this.api});
  final Api api;

  @override
  State<Inicio> createState() => _InicioState();
}

class _InicioState extends State<Inicio> {
  int _pestana = 0;
  final _verificar = GlobalKey<VerificarState>();

  @override
  void initState() {
    super.initState();
    Compartir.escuchar(_recibir);
    Compartir.textoInicial().then((t) {
      if (t != null && mounted) _recibir(t);
    });
  }

  void _recibir(String texto) {
    setState(() => _pestana = 0);
    WidgetsBinding.instance.addPostFrameCallback((_) => _verificar.currentState?.cargarCompartido(texto));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: IndexedStack(
          index: _pestana,
          children: [
            Verificar(key: _verificar, api: widget.api),
            ObservatorioPantalla(api: widget.api),
            const Acerca(),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _pestana,
        onDestinationSelected: (i) => setState(() => _pestana = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.verified_user_outlined), selectedIcon: Icon(Icons.verified_user), label: 'Verificar'),
          NavigationDestination(icon: Icon(Icons.insights_outlined), selectedIcon: Icon(Icons.insights), label: 'Observatorio'),
          NavigationDestination(icon: Icon(Icons.shield_outlined), selectedIcon: Icon(Icons.shield), label: 'Privacidad'),
        ],
      ),
    );
  }
}
