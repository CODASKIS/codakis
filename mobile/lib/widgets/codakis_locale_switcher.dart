import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../core/locale_scope.dart';

enum CodakisLocaleVariant { mobile, navbar }

class CodakisLocaleSwitcher extends StatelessWidget {
  const CodakisLocaleSwitcher({
    super.key,
    this.variant = CodakisLocaleVariant.mobile,
  });

  final CodakisLocaleVariant variant;

  static const _options = ['fr', 'en'];

  @override
  Widget build(BuildContext context) {
    final localeService = LocaleScope.serviceOf(context);
    final strings = localeService.strings;
    final current = localeService.isEnglish ? 'en' : 'fr';
    final isNavbar = variant == CodakisLocaleVariant.navbar;

    return Semantics(
      label: strings.langSwitch,
      child: Container(
        decoration: BoxDecoration(
          color: isNavbar ? Colors.white.withValues(alpha: 0.12) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(6),
        ),
        padding: const EdgeInsets.all(2),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: _options.map((code) {
            final selected = current == code;
            return Padding(
              padding: EdgeInsets.only(right: code == _options.last ? 0 : 2),
              child: _LocaleButton(
                label: code == 'fr' ? strings.langFr : strings.langEn,
                selected: selected,
                isNavbar: isNavbar,
                onTap: () => localeService.setLocale(code),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _LocaleButton extends StatelessWidget {
  const _LocaleButton({
    required this.label,
    required this.selected,
    required this.isNavbar,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final bool isNavbar;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final inactiveColor = isNavbar ? Colors.white.withValues(alpha: 0.85) : CodakisColors.navBg;
    return Material(
      color: selected ? CodakisColors.primary : Colors.transparent,
      borderRadius: BorderRadius.circular(CodakisRadii.button),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(CodakisRadii.button),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: selected ? Colors.white : inactiveColor,
              height: 1,
            ),
          ),
        ),
      ),
    );
  }
}
