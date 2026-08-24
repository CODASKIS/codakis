import 'package:flutter/material.dart';

import '../core/app_theme.dart';

class CodakisLocaleSwitcher extends StatelessWidget {
  const CodakisLocaleSwitcher({
    super.key,
    required this.locale,
    required this.onChanged,
  });

  final String locale;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: CodakisColors.surfaceMuted,
        borderRadius: BorderRadius.circular(CodakisRadii.pill),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.translate, size: 16, color: CodakisColors.textMuted),
          const SizedBox(width: 6),
          _Chip(label: 'FR', selected: locale == 'fr', onTap: () => onChanged('fr')),
          Text(' | ', style: TextStyle(color: CodakisColors.textMuted.withValues(alpha: 0.7))),
          _Chip(label: 'EN', selected: locale == 'en', onTap: () => onChanged('en')),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: TextStyle(
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          color: selected ? CodakisColors.textPrimary : CodakisColors.textMuted,
        ),
      ),
    );
  }
}
