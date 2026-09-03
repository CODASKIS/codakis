import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_theme.dart';

/// Champs alignés sur `.codakis-auth-box` / `.fj-input` du site.
class CodakisInputStyles {
  static const fieldHeight = 44.0;
  static const horizontalPadding = 12.0;

  static TextStyle get labelStyle => GoogleFonts.nunito(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: CodakisColors.textPrimary,
        height: 1.3,
      );

  static TextStyle get textStyle => GoogleFonts.nunito(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: CodakisColors.textPrimary,
        height: 1.4,
      );

  static TextStyle get hintStyle => GoogleFonts.nunito(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: const Color(0xFF667085),
        height: 1.4,
      );

  static BoxDecoration boxDecoration({required bool focused, bool hasError = false, bool readOnly = false}) {
    final borderColor = hasError
        ? CodakisColors.accentRed
        : focused
            ? CodakisColors.primary
            : CodakisColors.border;
    return BoxDecoration(
      color: readOnly ? CodakisColors.surfaceAlt : Colors.white,
      borderRadius: BorderRadius.circular(CodakisRadii.field),
      border: Border.all(color: borderColor, width: focused ? 1.5 : 1),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.12),
          blurRadius: 4,
          offset: const Offset(0, 2),
        ),
      ],
    );
  }

  static InputDecoration innerDecoration({
    String? hintText,
    Widget? prefixIcon,
    Widget? suffixIcon,
    String? errorText,
  }) {
    return InputDecoration(
      isDense: true,
      hintText: hintText,
      hintStyle: hintStyle,
      errorText: errorText,
      errorStyle: GoogleFonts.nunito(fontSize: 13, color: CodakisColors.accentRed),
      border: InputBorder.none,
      enabledBorder: InputBorder.none,
      focusedBorder: InputBorder.none,
      errorBorder: InputBorder.none,
      focusedErrorBorder: InputBorder.none,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: horizontalPadding,
        vertical: 11,
      ),
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
    );
  }
}
