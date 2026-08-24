import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Palette alignée sur `flexjobs/styles/codakis-overrides.css`.
class CodakisColors {
  static const navBg = Color(0xFF1A1A1A);
  static const primary = Color(0xFF00A859);
  static const primaryHover = Color(0xFF008F4C);
  static const link = Color(0xFF00A859);
  static const surfaceAlt = Color(0xFFECFDF5);
  static const accentRed = Color(0xFFEE1C25);
  static const accentOrange = Color(0xFFFBB03B);
  static const textPrimary = Color(0xFF3E3D3F);
  static const textMuted = Color(0xFF64748B);
  static const border = Color(0xFFCCCCCC);
  static const surfaceMuted = Color(0xFFF3F4F6);
  static const dotInactive = Color(0xFFD1D5DB);
}

class CodakisRadii {
  static const button = 4.0;
  static const card = 12.0;
  static const pill = 999.0;
  static const field = 4.0;
}

ThemeData buildCodakisTheme() {
  final baseText = GoogleFonts.nunitoTextTheme();
  final textTheme = baseText.copyWith(
    headlineSmall: GoogleFonts.nunito(
      fontSize: 26,
      fontWeight: FontWeight.w700,
      color: CodakisColors.textPrimary,
      height: 1.25,
    ),
    headlineMedium: GoogleFonts.nunito(
      fontSize: 28,
      fontWeight: FontWeight.w700,
      color: CodakisColors.textPrimary,
    ),
    titleLarge: GoogleFonts.nunito(
      fontSize: 20,
      fontWeight: FontWeight.w700,
      color: CodakisColors.textPrimary,
    ),
    titleMedium: GoogleFonts.nunito(
      fontSize: 17,
      fontWeight: FontWeight.w600,
      color: CodakisColors.textPrimary,
    ),
    bodyLarge: GoogleFonts.nunito(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: CodakisColors.textMuted,
      height: 1.55,
    ),
    bodyMedium: GoogleFonts.nunito(
      fontSize: 15,
      fontWeight: FontWeight.w400,
      color: CodakisColors.textMuted,
      height: 1.5,
    ),
    labelLarge: GoogleFonts.nunito(
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: Colors.white,
    ),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: CodakisColors.primary,
      primary: CodakisColors.primary,
      onPrimary: Colors.white,
      surface: Colors.white,
      onSurface: CodakisColors.textPrimary,
    ),
    scaffoldBackgroundColor: Colors.white,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: CodakisColors.navBg,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.nunito(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
      iconTheme: const IconThemeData(color: Colors.white),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.card),
        side: BorderSide(color: CodakisColors.border.withValues(alpha: 0.55)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      labelStyle: GoogleFonts.nunito(color: CodakisColors.textMuted),
      hintStyle: GoogleFonts.nunito(color: CodakisColors.textMuted.withValues(alpha: 0.8)),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: CodakisColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: CodakisColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: CodakisColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: CodakisColors.accentRed),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: CodakisColors.primary,
        foregroundColor: Colors.white,
        disabledBackgroundColor: CodakisColors.primary.withValues(alpha: 0.45),
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(CodakisRadii.button),
        ),
        textStyle: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: CodakisColors.primary,
        side: const BorderSide(color: CodakisColors.primary),
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(CodakisRadii.button),
        ),
        textStyle: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: CodakisColors.textMuted,
        textStyle: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: CodakisColors.primary,
    ),
  );
}
