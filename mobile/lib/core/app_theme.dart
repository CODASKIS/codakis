import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'codakis_button_styles.dart';
import 'constants/app_colors.dart';
import 'constants/app_defaults.dart';

export 'codakis_button_styles.dart'
    show CodakisColors, CodakisRadii, CodakisButtonStyles, CodakisButtonVariant, CodakisButtonSize;

ThemeData buildCodakisTheme() {
  final base = GoogleFonts.nunitoTextTheme();
  final textTheme = base.copyWith(
    headlineSmall: GoogleFonts.nunito(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 22),
    headlineMedium: GoogleFonts.nunito(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 26),
    titleLarge: GoogleFonts.nunito(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 20),
    titleMedium: GoogleFonts.nunito(color: Colors.black, fontWeight: FontWeight.w600, fontSize: 17),
    bodyLarge: GoogleFonts.nunito(color: AppColors.placeholder, fontSize: 16, height: 1.5),
    bodyMedium: GoogleFonts.nunito(color: AppColors.placeholder, fontSize: 15, height: 1.5),
    labelLarge: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
  );

  return ThemeData(
    useMaterial3: true,
    colorSchemeSeed: AppColors.primary,
    fontFamily: GoogleFonts.nunito().fontFamily,
    textTheme: textTheme,
    scaffoldBackgroundColor: AppColors.scaffoldBackground,
    brightness: Brightness.light,
    appBarTheme: AppBarTheme(
      elevation: 0.3,
      backgroundColor: AppColors.scaffoldBackground,
      foregroundColor: Colors.black,
      iconTheme: const IconThemeData(color: Colors.black),
      titleTextStyle: GoogleFonts.nunito(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 18),
      systemOverlayStyle: SystemUiOverlayStyle.dark,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: CodakisButtonStyles.primary(variant: CodakisButtonVariant.auth, expand: false),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: CodakisButtonStyles.primary(variant: CodakisButtonVariant.site),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: CodakisButtonStyles.outline(),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        textStyle: GoogleFonts.nunito(fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      fillColor: AppColors.textInputBackground,
      filled: true,
      floatingLabelBehavior: FloatingLabelBehavior.never,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: AppColors.gray),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: AppColors.gray),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      suffixIconColor: AppColors.placeholder,
      hintStyle: GoogleFonts.nunito(color: AppColors.placeholder),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.primary),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: AppDefaults.borderRadius),
    ),
  );
}

InputDecorationTheme get pgSecondaryInputTheme => InputDecorationTheme(
      fillColor: AppColors.textInputBackground,
      filled: true,
      floatingLabelBehavior: FloatingLabelBehavior.never,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );

InputDecorationTheme get pgOtpInputTheme => InputDecorationTheme(
      floatingLabelBehavior: FloatingLabelBehavior.never,
      border: OutlineInputBorder(
        borderSide: const BorderSide(width: 0.1),
        borderRadius: BorderRadius.circular(25),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: const BorderSide(width: 0.1),
        borderRadius: BorderRadius.circular(25),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(width: 0.1, color: AppColors.primary),
        borderRadius: BorderRadius.circular(25),
      ),
    );
