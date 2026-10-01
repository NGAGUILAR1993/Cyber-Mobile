import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'pantallas/inicio.dart';
import 'servicios/api.dart';
import 'tema.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Marca.superficie,
  ));
  runApp(CyberMobileApp(api: Api()));
}

class CyberMobileApp extends StatelessWidget {
  const CyberMobileApp({super.key, required this.api});
  final Api api;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cyber Mobile',
      debugShowCheckedModeBanner: false,
      theme: temaCyber(),
      locale: const Locale('es', 'AR'),
      home: Inicio(api: api),
    );
  }
}
