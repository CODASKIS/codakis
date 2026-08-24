import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'constants/app_colors.dart';

/// Styles boutons alignés sur `.fj-btn` et `.codakis-auth-form__submit` du site web.
enum CodakisButtonVariant { site, auth }

enum CodakisButtonSize { sm, md, lg }

class CodakisButtonStyles {
  static const borderWidth = 1.0;

  static TextStyle labelStyle(CodakisButtonSize size, CodakisButtonVariant variant) {
    final weight = variant == CodakisButtonVariant.auth
        ? FontWeight.w700
        : size == CodakisButtonSize.lg
            ? FontWeight.w500
            : FontWeight.w500;
    final fontSize = switch (size) {
      CodakisButtonSize.sm => 15.0,
      CodakisButtonSize.md => 16.0,
      CodakisButtonSize.lg => 18.0,
    };
    return GoogleFonts.nunito(fontSize: fontSize, fontWeight: weight, height: 1.25);
  }

  static EdgeInsets paddingFor(CodakisButtonSize size, CodakisButtonVariant variant) {
    if (variant == CodakisButtonVariant.auth) {
      return const EdgeInsets.symmetric(horizontal: 14, vertical: 10);
    }
    return switch (size) {
      CodakisButtonSize.sm => const EdgeInsets.symmetric(horizontal: 12.5, vertical: 6.5),
      CodakisButtonSize.md => const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      CodakisButtonSize.lg => const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    };
  }

  static double minHeightFor(CodakisButtonSize size, CodakisButtonVariant variant) {
    if (variant == CodakisButtonVariant.auth) return 44;
    return switch (size) {
      CodakisButtonSize.sm => 36,
      CodakisButtonSize.md => 40,
      CodakisButtonSize.lg => 48,
    };
  }

  static BorderRadius borderRadius([double radius = CodakisRadii.button]) =>
      BorderRadius.circular(radius);

  static ButtonStyle primary({
    bool expand = false,
    double radius = CodakisRadii.button,
    CodakisButtonVariant variant = CodakisButtonVariant.site,
    CodakisButtonSize size = CodakisButtonSize.md,
  }) {
    final auth = variant == CodakisButtonVariant.auth;
    return ButtonStyle(
      elevation: WidgetStateProperty.all(auth ? 2 : 0),
      shadowColor: WidgetStateProperty.all(
        auth ? Colors.black.withValues(alpha: 0.12) : Colors.transparent,
      ),
      surfaceTintColor: WidgetStateProperty.all(Colors.transparent),
      padding: WidgetStateProperty.all(paddingFor(size, variant)),
      minimumSize: WidgetStateProperty.all(
        Size(expand ? double.infinity : 0, minHeightFor(size, variant)),
      ),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      textStyle: WidgetStateProperty.all(
        labelStyle(size, variant).copyWith(color: Colors.white),
      ),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return Colors.white.withValues(alpha: 0.85);
        }
        return Colors.white;
      }),
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return AppColors.primary.withValues(alpha: 0.45);
        }
        if (states.contains(WidgetState.pressed) || states.contains(WidgetState.hovered)) {
          return AppColors.primaryDark;
        }
        return AppColors.primary;
      }),
      side: WidgetStateProperty.resolveWith((states) {
        if (auth) return BorderSide.none;
        final color = states.contains(WidgetState.disabled)
            ? AppColors.primary.withValues(alpha: 0.45)
            : states.contains(WidgetState.pressed) || states.contains(WidgetState.hovered)
                ? AppColors.primaryDark
                : AppColors.primary;
        return BorderSide(color: color, width: borderWidth);
      }),
      shape: WidgetStateProperty.all(
        RoundedRectangleBorder(borderRadius: borderRadius(radius)),
      ),
      overlayColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.pressed)) {
          return Colors.white.withValues(alpha: 0.12);
        }
        return null;
      }),
    );
  }

  static ButtonStyle outline({
    bool expand = false,
    double radius = CodakisRadii.button,
    CodakisButtonSize size = CodakisButtonSize.md,
  }) {
    return ButtonStyle(
      elevation: WidgetStateProperty.all(0),
      shadowColor: WidgetStateProperty.all(Colors.transparent),
      surfaceTintColor: WidgetStateProperty.all(Colors.transparent),
      padding: WidgetStateProperty.all(paddingFor(size, CodakisButtonVariant.site)),
      minimumSize: WidgetStateProperty.all(
        Size(expand ? double.infinity : 0, minHeightFor(size, CodakisButtonVariant.site)),
      ),
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      textStyle: WidgetStateProperty.all(
        labelStyle(size, CodakisButtonVariant.site).copyWith(color: AppColors.primary),
      ),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return AppColors.primary.withValues(alpha: 0.45);
        }
        if (states.contains(WidgetState.pressed) || states.contains(WidgetState.hovered)) {
          return AppColors.primaryDark;
        }
        return AppColors.primary;
      }),
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.pressed) || states.contains(WidgetState.hovered)) {
          return AppColors.coloredBackground;
        }
        return Colors.transparent;
      }),
      side: WidgetStateProperty.resolveWith((states) {
        final color = states.contains(WidgetState.disabled)
            ? AppColors.primary.withValues(alpha: 0.45)
            : states.contains(WidgetState.pressed) || states.contains(WidgetState.hovered)
                ? AppColors.primaryDark
                : AppColors.primary;
        return BorderSide(color: color, width: borderWidth);
      }),
      shape: WidgetStateProperty.all(
        RoundedRectangleBorder(borderRadius: borderRadius(radius)),
      ),
      overlayColor: WidgetStateProperty.all(Colors.transparent),
    );
  }
}

/// Alias rétrocompat — palette site CODAKIS.
class CodakisColors {
  static const navBg = AppColors.textDark;
  static const primary = AppColors.primary;
  static const primaryHover = AppColors.primaryDark;
  static const link = AppColors.primary;
  static const surfaceAlt = AppColors.coloredBackground;
  static const accentRed = AppColors.error;
  static const accentOrange = Color(0xFFFBB03B);
  static const textPrimary = AppColors.textDark;
  static const textMuted = AppColors.placeholder;
  static const border = AppColors.gray;
  static const surfaceMuted = AppColors.cardColor;
  static const dotInactive = AppColors.gray;
}

class CodakisRadii {
  static const button = 4.0;
  static const card = 12.0;
  static const pill = 999.0;
  static const field = 4.0;
}
