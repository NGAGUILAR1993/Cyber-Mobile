import 'package:flutter/material.dart';

import '../config.dart';
import '../servicios/compartir.dart';
import '../tema.dart';

class Acerca extends StatelessWidget {
  const Acerca({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    Widget punto(IconData i, String titulo, String texto) => Padding(
          padding: const EdgeInsets.only(bottom: 18),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(i, color: Marca.acento, size: 22),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(titulo, style: t.titleMedium),
                const SizedBox(height: 4),
                Text(texto, style: t.bodyMedium),
              ]),
            ),
          ]),
        );
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Text('Tu privacidad', style: t.headlineMedium),
        const SizedBox(height: 8),
        Text('Cómo cuida tus datos Cyber Mobile.', style: t.bodyLarge),
        const SizedBox(height: 24),
        punto(Icons.do_not_disturb_on_outlined, 'Sin permisos invasivos',
            'La app no lee tus SMS, llamadas, contactos ni fotos. Solo analiza lo que vos escribís o compartís.'),
        punto(Icons.lock_outline, 'Conexión cifrada',
            'Todo viaja por HTTPS a los servidores de Cyber Mobile. La app no se conecta a otros sitios.'),
        punto(Icons.phonelink_erase_outlined, 'Nada guardado en el teléfono',
            'No guardamos un historial de lo que verificás en el dispositivo ni en copias de seguridad.'),
        punto(Icons.analytics_outlined, 'Sin publicidad ni rastreo',
            'No hay anuncios ni herramientas de seguimiento de terceros.'),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => abrir(Config.politicaPrivacidad),
          icon: const Icon(Icons.description_outlined, size: 18),
          label: const Text('Política de privacidad completa'),
        ),
        const SizedBox(height: 10),
        OutlinedButton.icon(
          onPressed: () => abrirWhatsApp('Hola, tengo una consulta sobre la app Cyber Mobile.'),
          icon: const Icon(Icons.chat_outlined, size: 18),
          label: const Text('Contacto por WhatsApp'),
        ),
        const SizedBox(height: 28),
        Center(child: Text('Cyber Mobile · versión ${Config.version}', style: mono.copyWith(color: Marca.apagado, fontSize: 12))),
      ],
    );
  }
}
