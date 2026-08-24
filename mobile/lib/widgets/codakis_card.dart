import 'package:flutter/material.dart';

import '../core/app_theme.dart';

/// Carte alignée sur `.fj-card` du site (bordure #E5E5E5, radius 4px, ombre légère).
class CodakisCard extends StatelessWidget {
  const CodakisCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.margin,
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;

  static BoxDecoration decoration({Color? color}) => BoxDecoration(
        color: color ?? Colors.white,
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        border: Border.all(color: const Color(0xFFE5E5E5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      );

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: margin,
      decoration: decoration(),
      child: Padding(padding: padding, child: child),
    );

    if (onTap == null) return card;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(CodakisRadii.field),
        child: card,
      ),
    );
  }
}
