import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_theme.dart';
import '../data/cemac_countries.dart';
import 'codakis_logo.dart';

/// En-tête auth : logo CODAKIS + titre + sous-titre + contenu.
class CodakisLogoTitleLayout extends StatelessWidget {
  const CodakisLogoTitleLayout({
    super.key,
    required this.title,
    required this.children,
    this.subtitle = '',
    this.logoHeight = 72,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;
  final double logoHeight;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Column(
              children: [
                SizedBox(height: constraints.maxHeight * 0.04),
                CodakisLogo(height: logoHeight),
                SizedBox(height: constraints.maxHeight * 0.05),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                ),
                if (subtitle.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    subtitle,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          height: 1.5,
                          color: CodakisColors.textMuted,
                        ),
                  ),
                ],
                const SizedBox(height: 24),
                ...children,
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Champ auth mobile — fond vert clair, coins arrondis (style signup).
class CodakisSoftField extends StatelessWidget {
  const CodakisSoftField({
    super.key,
    this.controller,
    this.hintText,
    this.label,
    this.keyboardType,
    this.obscureText = false,
    this.validator,
    this.suffixIcon,
    this.onChanged,
  });

  final TextEditingController? controller;
  final String? hintText;
  final String? label;
  final TextInputType? keyboardType;
  final bool obscureText;
  final String? Function(String?)? validator;
  final Widget? suffixIcon;
  final ValueChanged<String>? onChanged;

  static InputDecoration decoration(BuildContext context, {String? hint, Widget? suffix}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.nunito(color: CodakisColors.textMuted.withValues(alpha: 0.85)),
      filled: true,
      fillColor: CodakisColors.surfaceAlt,
      contentPadding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: const BorderSide(color: CodakisColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(28),
        borderSide: const BorderSide(color: CodakisColors.accentRed),
      ),
      suffixIcon: suffix,
    );
  }

  @override
  Widget build(BuildContext context) {
    final field = TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      validator: validator,
      onChanged: onChanged,
      style: GoogleFonts.nunito(fontSize: 15, color: CodakisColors.textPrimary),
      decoration: decoration(context, hint: hintText, suffix: suffixIcon),
    );

    if (label == null) return field;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label!,
          style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: CodakisColors.textPrimary),
        ),
        const SizedBox(height: 8),
        field,
      ],
    );
  }
}

/// Dropdown pays CEMAC avec le même style soft.
class CodakisSoftCountryField extends StatelessWidget {
  const CodakisSoftCountryField({
    super.key,
    required this.value,
    required this.onChanged,
    required this.hintText,
  });

  final String value;
  final ValueChanged<String?> onChanged;
  final String hintText;

  @override
  Widget build(BuildContext context) {
    final isEnglish = Localizations.localeOf(context).languageCode.startsWith('en');
    return DropdownButtonFormField<String>(
      key: ValueKey(value),
      initialValue: value,
      icon: const Icon(Icons.expand_more, color: CodakisColors.textMuted),
      decoration: CodakisSoftField.decoration(context, hint: hintText),
      style: GoogleFonts.nunito(fontSize: 15, color: CodakisColors.textPrimary),
      dropdownColor: Colors.white,
      borderRadius: BorderRadius.circular(CodakisRadii.field),
      items: cemacCountries
          .map(
            (c) => DropdownMenuItem(
              value: c.code,
              child: Text(c.label(isEnglish)),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}
