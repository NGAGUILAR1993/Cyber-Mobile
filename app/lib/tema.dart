import 'package:flutter/material.dart';

/// Colores de la marca, los mismos que la web.
class Marca {
  static const fondo = Color(0xFF05070D);
  static const superficie = Color(0xFF0A0F1C);
  static const panel = Color(0xFF111827);
  static const linea = Color(0x24949FB8);
  static const texto = Color(0xFFE6EDF7);
  static const texto2 = Color(0xFFC3CEDD);
  static const apagado = Color(0xFF9AA8BD);
  static const acento = Color(0xFF22D3EE);
  static const tintaAcento = Color(0xFF04121A);
  static const alto = Color(0xFFFB923C);
  static const medio = Color(0xFFFACC15);
  static const seguro = Color(0xFF34D399);
  static const info = Color(0xFF60A5FA);
}

TextStyle _peso(TextStyle? base, double w) =>
    (base ?? const TextStyle()).copyWith(fontVariations: [FontVariation('wght', w)]);

ThemeData temaCyber() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    fontFamily: 'SpaceGrotesk',
    scaffoldBackgroundColor: Marca.fondo,
    colorScheme: const ColorScheme.dark(
      primary: Marca.acento,
      onPrimary: Marca.tintaAcento,
      secondary: Marca.acento,
      surface: Marca.superficie,
      onSurface: Marca.texto,
      error: Marca.alto,
    ),
  );
  final t = base.textTheme;
  return base.copyWith(
    textTheme: t.copyWith(
      headlineLarge: _peso(t.headlineLarge, 700).copyWith(color: Marca.texto, height: 1.1),
      headlineMedium: _peso(t.headlineMedium, 700).copyWith(color: Marca.texto, height: 1.15),
      headlineSmall: _peso(t.headlineSmall, 650).copyWith(color: Marca.texto),
      titleLarge: _peso(t.titleLarge, 650).copyWith(color: Marca.texto),
      titleMedium: _peso(t.titleMedium, 600).copyWith(color: Marca.texto),
      bodyLarge: t.bodyLarge?.copyWith(color: Marca.texto2, height: 1.55),
      bodyMedium: t.bodyMedium?.copyWith(color: Marca.texto2, height: 1.5),
      labelLarge: _peso(t.labelLarge, 600),
    ),
    appBarTheme: const AppBarTheme(backgroundColor: Marca.fondo, surfaceTintColor: Colors.transparent, elevation: 0),
    cardTheme: CardThemeData(
      color: Marca.superficie,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: Marca.linea)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: Marca.acento,
        foregroundColor: Marca.tintaAcento,
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: _peso(const TextStyle(fontSize: 16, fontFamily: 'SpaceGrotesk'), 650),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Marca.texto,
        minimumSize: const Size.fromHeight(52),
        side: const BorderSide(color: Color(0x47949FB8)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Marca.superficie,
      hintStyle: const TextStyle(color: Marca.apagado),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Marca.linea)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Marca.linea)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Marca.acento, width: 1.5)),
      errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Marca.alto)),
      contentPadding: const EdgeInsets.all(16),
    ),
    chipTheme: base.chipTheme.copyWith(
      backgroundColor: Marca.superficie,
      selectedColor: Marca.acento,
      side: const BorderSide(color: Marca.linea),
      shape: const StadiumBorder(),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Marca.superficie,
      indicatorColor: const Color(0x2922D3EE),
      surfaceTintColor: Colors.transparent,
      iconTheme: WidgetStateProperty.resolveWith((s) =>
          IconThemeData(color: s.contains(WidgetState.selected) ? Marca.acento : Marca.apagado)),
      labelTextStyle: WidgetStateProperty.resolveWith((s) => TextStyle(
          fontSize: 12, color: s.contains(WidgetState.selected) ? Marca.acento : Marca.apagado)),
    ),
    dividerColor: Marca.linea,
  );
}

const mono = TextStyle(fontFamily: 'JetBrainsMono');
